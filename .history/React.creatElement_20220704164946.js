// https://blog.csdn.net/cc18868876837/article/details/111920385 相关博客

export function createElement (type, config, children){
    // 存放后面需要用到的元素属性
    let propsName;
    // 存放元素属性键值对集合
    const props = {}
    // key、ref、self、source 均为 React 元素的属性，此处不必深究 key, ref, self, source
    let key = null;
    let ref = null; 
    let self = null; 
    let source = null; 

    // config 对象中存储的是元素的属性
    if(config !== null){
        // 进来之后做的第一件事，是依次对 ref、key、self 和 source 属性赋值
        if(hasValidRef(config)){
            ref = config.ref
        }
    }
}