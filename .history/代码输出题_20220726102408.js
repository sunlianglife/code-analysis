/*********
    1、实现 (5).add(3).minus(2) 功能
    例如 5+3-2 = 6
    valueOf()函数返回指定对象的原始值
*/
Number.prototype.add = function(n){
    return this.valueOf() +  n
}
Number.prototype.minus  = function(n){
    return this.valueOf - n
}

//*********** 2、代码输出
var obj = { 
    '2': 3, 
    '3': 4, 
    'length': 2, 
    'splice': Array.prototype.splice, 
    'push': Array.prototype.push
}
obj.push(1)
obj.push(2)
console.log(obj) 
// 打印结果还是这个伪数组，
obj = {
    '2': 1, 
    '3': 2, 
    'length': 4,  
    'splice': Array.prototype.splice, 
    'push': Array.prototype.push
}

/******
  3、实现一个 sleep 函数
  比如 sleep(1000) 意味着等待 1000 毫秒，可从 Promise、Generator、Async/Await 等角度实现
*/

const sleep = (time) => {
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve()
        }, time)
    })
} 
sleep(1000)

// ***** 4、代码输出
var a = 10;
(function () { 
    console.log(a) 
    a = 5 
    console.log(window.a)  // 全局作用域的a
    var a = 20; 
    console.log(a) // 函数作用域的a
})()
// 结果 undefined 10 20， 

// **** （京东）下面代码中 a 在什么情况下会打印 1？
var a = '什么'; 
if(a == 1 && a == 2 && a == 3){ 
    console.log(1); 
}

// 结果 1
a = {
    i: 1,
    toString(){
        return this.i++
    }
}
// 结果 2
a = [1, 2, 3]
a.toString = a.shift()