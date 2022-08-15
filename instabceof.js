function newInstanceof(a, b) {
  while (true) {
    if(a.__proto === b.prototype) return true;
    if(a.__proto === null) return false
    a = a.__proto__
  }
}