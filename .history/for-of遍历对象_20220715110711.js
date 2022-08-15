let obj = {
    a: 11,
    b: 22,
}
// 第一种
// obj[Symbol.iterator] = function() {
//     const _self = this
//     const keys = Object.keys(_self)
//     let index = 0
//     return {
//         next(){
//             if(index === keys.length){
//                 return {
//                     done: true,
//                 }
//             }else {
//                 return{
//                     value: [keys[index], _self[keys[index++]]],
//                     done: false,
//                 }
//             }
//         }
//     }
// }

// for(let [key, value] of obj){
//     console.log(key, value)
// }

// 第二种
// for(let [key, value]  of Object.entries(obj)){
//     console.log(key, value)
// }

// 第三种
obj[Symbol.iterator] = function* myIterator () {
    for(let key of Object.keys(this))
      yield this[key];
}

for(let value of obj){
    console.log(value)
}