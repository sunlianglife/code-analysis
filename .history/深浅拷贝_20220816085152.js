// 浅拷贝
/**
 * 对基础类型做一个基本的拷贝
 * 对引用类型开辟一个新的存储，并且拷贝一层对象属性
 */

 const shallowClone = (target) => {
    if(typeof target === 'object' && target !== null){
        const cloneObj = Array.isArray(target) ? [] : {}
        for(let key in target){
            if(target.hasOwnProperty(key)){
                cloneObj[key] = target[key]
            }
        }
    }
    return target;
 }