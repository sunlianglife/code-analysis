Function.prototype.myCall = function (context, ...args) {
    let context = context || window
    context.fn = this
    let result = context.fn(...args)
    // delete context.fn
    Reflect.defineProperty(context, 'fn')
    // return result
}

// Function.prototype.apply = function(context, args) {
//     let context = context || window
//     context.fn = this
//     let result = context.fn(...args)
//     // delete context.fn
//     Reflect.deleteProperty(context, 'fn')
//     return result
// }

function func(){
    console.log(this.name)
    return 11
}
var a ={
    name : 'dudu'
}
     
console.log(func.call(a))//this指向对象 a
     