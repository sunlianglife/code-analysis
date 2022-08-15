// Function.prototype.call = function (context, ...args) {
//     let context = context || window
//     context.fn = this
//     let result = context.fn(...args)
//     // delete context.fn
//     Reflect.defineProperty(context, 'fn')
//     return result
// }

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
}
var a ={
    name : 'dudu'
}
     
func.call(a)//this指向对象 a
     