
function debounce (callBack, time) {
    let timer = null;
    return function() {
        clearTimeout(timer)
        timer = setTimeout(()=>{
            callBack.apply(this, arguments)
        }, time)
    }
}

function throttle (callBack, time) {
    let flag = false
    return function(){
        if(flag) return;
        flag = true
        setTimeout(()=>{
            callBack.apply(this, arguments)
            flag = false
        }, time)
    }
}