function fn(callback, wait){
    let timer = null
    return function(){
        clearTimeout(timer)
        timer = setTimeout(()=>{
            callback.apply(this, arguments)
        },wait)
    }
}

function fn1(callback, wait){
    let flag = false
    return function(){
        if(flag) return
        flag = true
        setTimeout(()=>{
            callback.apply(this, arguments)
            flag = false
        }, wait)
    }
}