function compose(...fns){
    return function(...ars){
        return fns.reduce((pre, next)=>{
            // 第一个pre是函数，后面是结果
            return typeof pre === 'function' ? next(pre(...args)) : next(...args)
        })
    }
}