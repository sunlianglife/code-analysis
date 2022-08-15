// 1、原型链继承

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
