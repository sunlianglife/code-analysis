
let result = []
for(let i = 0; i < 200; i++){
    if(i === Number(i.toString().split('').reverse().join(''))){
        result.push(i)
    }
}
console.log(result)