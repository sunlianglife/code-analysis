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

// 深拷贝

// 使用 JSON.stringfy 实现深拷贝的问题
/** 
 * 拷贝的对象的值中如果有函数、undefined、symbol 这几种类型，经过 JSON.stringify 序列化之后的字符串中这个键值对会消失；
 * 拷贝 Date 引用类型会变成字符串
 * 无法拷贝不可枚举的属性；
 * 无法拷贝对象的原型链
 * 拷贝 RegExp 引用类型会变成空对象；
 * 对象中含有 NaN、Infinity 以及 -Infinity，JSON 序列化的结果会变成 null
 * 无法拷贝对象的循环应用，即对象成环 (obj[key] = obj)。
*/

// 深拷贝
const deepClone = (target, hash = new WeakMap()) => {
    if(typeof target !== 'object' || target === null) return target;
    const cloneObj = Array.isArray(target) ? [] : {}

    // 手动处理Date和正则类型会返回空对象的问题
    // 这里我们直接自己返回一个new的实例
    if(target.constructor === Date) return new Date(target)
    if(target.constructor === RegExp) return new RegExp(target)

    // 处理循环引用
    if(hash.has(target)) return hash.get(target)
    hash.set(target, cloneObj)
    

    // 递归调用深拷贝函数
    // Reflect.ownKeys除了可枚举属性还可以返回不可枚举的属性和es6的symbol属性
    Reflect.ownKeys().forEach(item=>{
        cloneObj[item] = deepClone(target[item], hash)
    })

    return cloneObj
    
}