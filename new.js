
function myNew (fn, ...args) {
    let obj = {}
    obj._proto_ = fn.prototype
    fn.apply(obj, args)
    return Object.prototype.toString.call(obj) === '[object, object]' ? obj : {}
}