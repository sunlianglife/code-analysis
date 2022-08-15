function aa () {
  let cc = 1
  console.log(aa)
  return function(){
    return cc++
  }
}

let bb = aa()
console.log(bb(), 1)
console.log(bb(),2)