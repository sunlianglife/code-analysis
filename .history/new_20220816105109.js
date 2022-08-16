function myNew (target, ...args){
  let obj = {}
  obj.__proto__ = target.prototype
  target.apply(obj, args)
  return Object.prototype.toString().call(obj) === '[object Object]' ? obj : {}
}