export default class Watch {
  constructor () {
    this.emit = dispatchEvent.bind(document)
    this.listen = addEventListener.bind(document)
    this.eventUpdated = new Event('updated')
    this.eventRead = new Event('read')
    this.eventChanged = new Event('changed')
  }
  
  createProxy (obj) {
    let _this = this
    return addProxy(obj) // 这里的addProxy 函数是一个递归函数。
    function addProxy (...args) {
      let handler = {
        get (t, p) {
          _this.emit(_this.eventRead)
          addProxy(t, p) // 对嵌套对象进行代理
          return t[p]
        },
        set (t, p, v) {
          let oldValue = t[p]
          t[p] = v
          if (t[p] != oldValue) _this.emit(_this.eventChanged)
          _this.eventUpdated.value = t[p]
          _this.emit(_this.eventUpdated)
          return true
        }
      }
  
      if (args.length == 2 && typeof args[0][args[1]] === 'object') {
        args[0][args[1]] = new Proxy(args[0][args[1]], handler)// 判断对象的属性是不是一个嵌套的对象，如果是则代理
      } else {
        let proxy = new Proxy(args[0], handler)// 这是对最外围的对象进行代理
        return proxy
      }
    }
  }
  
  on (eventStr, callback) {
    if (!/,+/.test(eventStr)) {
      this.listen(eventStr, () => callback())
    } else {
      let eventStrArr = eventStr.split(',')
      for (let i = 0, len = eventStrArr.length; i < len; i++) {
        this.listen(eventStrArr[i].trim(), () => callback())// 这里只是让你可以写wather.on('updated, read', callback)
      }
    }
  }
}
const newObj = new Proxy(a, {
  get: function (target, key, receiver) {
    console.log(`getting ${key}!`)
    return Reflect.get(target, key, receiver)
  },
  set: function (target, key, value, receiver) {
    console.log(target, key, value, receiver)
    if (key === 'text') {
      input.value = value
      p.innerHTML = value
    }
    return Reflect.set(target, key, value, receiver)
  },
})
