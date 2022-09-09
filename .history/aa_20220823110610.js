function fn(n){
    if(n<2&&n>0) return n
    return fn(n-1)+fn(n-2)
}