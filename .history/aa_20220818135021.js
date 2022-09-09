function Person(){}
Person.prototype.aa = 22
let cc = new Person()
for(let i in aa){
    console.log(i)
}