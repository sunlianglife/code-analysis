let obj = {
    a: 11,
    b: 22,
}

obj[Symbol.iterator] = function() {
    const keys = Object.keys(this)
    let index = 0
    return {
        next(){
            if(index === keys.length){
                return {
                    done: true,
                }
            }else {
                return{
                    value: [keys[index], this[keys[index++]]],
                    done: false,
                }
            }
        }
    }
}

for(let value of obj){
    console.log(value)
}