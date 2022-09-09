// 文章详细地址 https://blog.csdn.net/qq_41534913/article/details/113620631

// 1、原型链继承
/**
 * 缺点
 * 1、引用类型属性被所有实例共享
 * 2、不能动态想perSon传参
 */
function Person(name) {
  this.name = name || 'sun'
  this.work = function() {
    console.log('加班')
  }
  this.works = ['文档', '代码']
}

Person.prototype.end = function() {
    console.log('下班')
}

function People() {}
People.prototype = new Person()
People.prototype.constructor = People


// 2、构造函数继承
/**
 * 避免了引用类型属性被所有实例共享
 * 可以动态的在People中向Person传参数
 * 缺点
 * 同样功能的方式被重复定义
 */

function Person(name = 'sun') {
    this.works = ['文档', '代码']
    this.work = function(){
      console.log(`${name}正在加班`)
    }
}
function People(name) {
    Person.call(this, name)
}

// 3、组合继承（原型链+构造函数）
/**
 * 用原型链实现对原型属性和方法的继承，用借用构造函数继承来实现对实例属性的继承
 * 
*/
function Person(name = 'sun'){
    this.works = ['文档', '代码']
}

Person.prototype.work = function(){
    console.log('加班')
}

function People (name, age) {
    Person.call(this, name)
    this.age = age
}
People.prototype = new Person()

// 4、原型式继承
/**
 * 缺点
 * 所有实例都会继承原型上的属性
 * 无法实现复用
 * 引用类型的值始终会共享相同的值
 */

function createObj (o) {
   function Fn() {}
   Fn.prototype = o
   return new Fn()
}
let person = {
    name: 'sun',
    age: 24,
    work: ['文档', '测试']
}

// let person1 = createObj(person)

// 5、寄生式继承
/**
 *  就是给原型式继承外面套个壳子
 *  缺点
 *  sayHello每次创建对象都会被执行
 * */ 

function createObj(obj){
    let newObj = Object.create(obj)
    newObj.work = ['文档','工作']
    newObj.sayHello = function() {
        console.log('hello')
    }
    return newObj
}
let obj = {
    name:'sun',
}
let person1 = createObj(obj)

// 6、寄生组合继承-常用
function Person(name = 'sun') {
    this.name = name
    this.works = ['文档', '代码']
}

// 将公有方法放在原型上
Person.prototype.work = function (){
    console.log(this.name)
}

function People(name){
    Person.call(this, name)
}

// 组合继承,看上面第三点（原理及存在的问题）
// People.prototype = new Person()

// 寄生组合继承
function createObj(){
    function F(){}
    F.prototype = o
    return new F()
}
// 继承原型上的属性和方法
// People.prototype = Object.create(Person.prototype)
People.prototype = createObj(Person.prototype)
//重写People.prototype的constructor属性,使其执行自己的构造函数People(修复实例，不然还是会指向Person)
People.prototype.constructor = People
let people1 = new People('李四')