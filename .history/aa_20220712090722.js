function aa () {
  let cc = 1
  console.log(aa)
  return function(){
    return cc++
  }
}

aa()()
aa()()