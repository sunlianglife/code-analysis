function myNew (target, ...args){
  let obj = {}
  obj.__proto__ = target.prototype
  target.apply(obj, args)
  return Object.prototype.toString().call(obj) === '[object Object]' ? obj : {}
}

Function.prototype.myCall = function (context, ...args) {
    let _this = context || window
    _this.fn = this
    const result = _this.fn(...args)
    Reflect.deleteProperty(_this, 'fn')
    return result
}

Function.prototype.myApply = function  (context, args) {
    let _this = context || window
    _this.fn = this
    const result = _this.fn(...args)
    Reflect.deleteProperty(_this, 'fn')
    return result
}

Function.prototype.myCall = function  (context, ...args) {
    let _this = this
    let result = function () {
        _this.apply()
    }
}