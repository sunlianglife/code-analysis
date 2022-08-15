let obj = {
    a: 11,
    b: 22,
}
// 第一种
obj[Symbol.iterator] = function() {
    const _self = this
    const keys = Object.keys(_self)
    let index = 0
    return {
        next(){
            if(index === keys.length){
                return {
                    done: true,
                }
            }else {
                return{
                    value: [keys[index], _self[keys[index++]]],
                    done: false,
                }
            }
        }
    }
}

// for(let [key, value] of obj){
//     console.log(key, value)
// }

// 第二种
// for(let [key, value]  of Object.entries(obj)){
//     console.log(key, value)
// }

// 第三种
obj[Symbol.iterator] = function* () {
    const _self  = this;
    // 第一种
    // 这里的循环不可以使用forEach,因为forEach循环不可中断
    // let index = 0;
    // const keys = Object.keys(_self);
    // while(index < keys.length){
    //     yield [keys[index], _self[keys[index++]]];
    // }
    // 第二种  for in 
    // for(let i in _self) yield [i, _self[i]];
    // 第三种 for of
    for(let i of Object.keys(_self)) yield [i, _self[i]];
}

for(let value of obj){
    console.log(value)
}