function ab(){
    let a = 1
    return function ac(){
       return a++
    }
}
const ac = ab()
console.log(ac()) 
console.log(ac()) 
console.log(ac()) 