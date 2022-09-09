function myNew (target, ...args){
  let obj = {}
  obj.__proto__ = target.prototype
  let result = target.apply(obj, args)
  return Object.prototype.toString().call(result) === '[object Object]' ? result : obj
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

Function.prototype.bind = function  (context, ...args) {
    let _this = this
    let result = function () {
        _this.apply(this instanceof _this ? this : context, [...args, ...arguments])
    }
    if(this.prototype){
        result.prototype = Object.create(this.prototype)
    }
    return result
}