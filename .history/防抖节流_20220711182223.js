
function debounce (callBack, time) {
    let timer = null;
    return function() {
        clearTimeout(timer)
        timer = setTimeout(()=>{
            callBack.apply(this, arguments)
        }, time)
    }
}