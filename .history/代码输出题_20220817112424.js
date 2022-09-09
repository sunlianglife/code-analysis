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

// **** 6、（京东）下面代码中 a 在什么情况下会打印 1？
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

// ********** 7、下面代码打印什么内容，why
var b = 10; 
(function b(){
  b = 20; 
  console.log(b); 
})();

// 打印b函数本身

// **** 8、输出以下代码的执行结果
var a = {n: 1}; 
var b = a;
a.x = a = {n: 2}; 
console.log(a.x) 
console.log(b.x)
/**
 * 首先，a 和 b 同时引用了{n:2}对象，接着执行到 a.x = a = {n：2}语句，尽管赋值 是从右到左的没错，
 * 但是.的优先级比=要高，所以这里首先执行 a.x，相当于为 a（或者 b）所指向的{n:1}对象新增了一个属性 x，
 * 即此时对象将变为 {n:1;x:undefined}。
 * 之后按正常情况，从右到左进行赋值，此时执行 a ={n:2}的时 候，a 的引用改变，指向了新对象{n：2},而 b 依然指向的是旧对象。
 * 之后执行 a.x = {n：2}的时候，并不会重新解析一遍 a，而是沿用最初解析 a.x 时候的 a， 也即旧对象，故此时旧对象的 x 的值为{n：2}，
 * 旧对象为 {n:1;x:{n：2}}，它被 b 引用着。后面输出 a.x 的时候，又要解析 a 了，此时的 a 是指向新对象的 a，而 这个新对象是没有 x 属性的，
 * 故访问时输出 undefined；而访问 b.x 的时候，将 输出旧对象的 x 的值，即{n:2}。
 * 
 */

// **** 9、给定两个数组，写一个方法来计算它们的交集。
// 例如：给定 nums1 = [1, 2, 2, 1]，nums2 = [2, 2]，返回 [2, 2]。
let newArray = nums1.filter(item=>nums2.includes(item));
// 或者
newArray = nums1.filter(item=>nums2.indexOf(item) > -1);

// **** 10、给定一个数组，将数组中的元素向右移动 k 个位置，其中 k 是非负数。 示例 1：
/**
 * 输入: [1, 2, 3, 4, 5, 6, 7] 和 k = 3 输出: [5, 6, 7, 1, 2, 3, 4]
 */

function test(arr, k){
    arr.unshift(...arr.splice(arr.length-k))
    return arr
}

// **** 11  打印出 1 - 10000 之间的所有对称数

let result = []
for(let i = 0; i < 20; i++){
    if(i === Number(i.toString().split('').reverse().join(''))){
        result.push(i)
    }
}
console.log(result)