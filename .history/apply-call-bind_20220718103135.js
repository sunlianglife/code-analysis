// Function.prototype.myCall = function (con, ...args) {
//     let context = con || window
//     context.fn = this
//     let result = context.fn(...args)
//     // delete context.fn
//     Reflect.deleteProperty(context, 'fn')
//     return result
// }

// Function.prototype.myApply = function(con, args) {
//     let context = context || window
//     context.fn = this
//     let result = context.fn(...args)
//     // delete context.fn
//     Reflect.deleteProperty(context, 'fn')
//     return result
// }

// Function.prototype.myBing = function(con, ...args) {
//     let _self = this
//     let result = function(){
//         _self.apply(this instanceof _self ? this : con, args.concat(Array.from(arguments)))
//     }
//     result.prototype = _self.prototype
//     return result
// }


var foo={
    value:1
  };
  function bar(){
    console.log(this.value)
  }
  bar.bind(foo)();