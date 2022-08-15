function myNew (fn, ...args) {
  let obj = {}
  obj._proto_ = fn.prototype
  obj.apply(fn, args)
  return Object.prototype.toString.call(obj) === '[object object]' ? obj : {}
}