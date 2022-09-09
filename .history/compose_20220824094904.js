// 组合函数
function compose(...fns){
    return function(...args){
        return fns.reduce((pre, next)=>{
            return typeof pre === 'function' ? next(pre(...ars)) : next(pre) 
        })
    }
}

function compose(...fns){
    return function(...args){
        return fns.reduce((pre, next)=>{
            return typeof pre === 'function' ? next(pre(...args)) : next(pre)
        })
    }
}