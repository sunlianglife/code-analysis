function newInstanceof(a, b) {
  while (true) {
    if(a.__proto === b.prototype) return true;
    if(a.__proto === null) return false
    a = a.__proto__
  }
}

// 第二种
function newInstanceof1(left, right) {
  // 这里先用typeof来判断基础数据类型，如果是，直接返回false
  if(typeof left !== 'object' || left == null) return false;
  // getProtypeOf是Object对象自带的API，能够拿到参数的原型对象
  let proto = Reflect.getPrototypeOf(left)
  while(true){
    if(proto === null) return false;
    if(proto === right.prototype) return true;
    proto = Reflect.getPrototypeOf(proto)
  }
}