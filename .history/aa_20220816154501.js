function ab(){
    let a = 1
    return function ac(){
       console.log(a++)
    }
}
ab()()
ab()()
ab()()