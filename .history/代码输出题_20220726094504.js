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