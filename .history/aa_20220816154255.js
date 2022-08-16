function ab(){
    let a = 1
    return function(){
       console.log(a++)
    }
}
ab()()