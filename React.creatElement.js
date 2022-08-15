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
        // 将key字符串化
        if(hasValidKey(config)){
            key = '' + config.key
        }
        self = config.__self === undefined ? null : config.__self;
        source = config.__source === undefined ? null : config.__source;
        for(propsName in config){
            if(
                hasOwnProperty.call(config, propsName) && 
                !RESERVED_PROPS.hasOwnProperty(propName) 
            ){
                props[propsName] = config(propsName)
            }
        }
    }
   // childrenLength 指的是当前元素的子元素的个数，减去的 2 是 type 和 config 两个参数占用的长度
    const childrenLength = arguments.length - 2
    // 如果抛去type和config，就只剩下一个参数，一般意味着文本节点出现了
    if(childrenLength === 1){
        props.children = children
        // 处理嵌套多个子元素的情况
    }else if(childrenLength > 1){
        const childrenArray = Array(childrenLength)
        for(let i = 0; i < childrenLength, i++){
            childrenArray[i] = arguments[i+2]
        }
        props.children = childrenArray
    }
    // 处理 defaultProps
    if (type && type.defaultProps) {
        const defaultProps = type.defaultProps;
        for (propName in defaultProps) { 
            if (props[propName] === undefined) {
                props[propName] = defaultProps[propName];
            }
        }
    }

    if (__DEV__) {
        // 这里是一些针对 __DEV__ 环境下的处理，暂时可以不用管
    }
    // 最后返回一个调用ReactElement执行方法，并传入刚才处理过的参数
    return ReactElement(
        type,
        key,
        ref,
        self,
        source,
        ReactCurrentOwner.current,
        props,
    )
}

const ReactElement = function(type, key, ref, self, source, owner, props) {
    const element = {
      // REACT_ELEMENT_TYPE是一个常量，用来标识该对象是一个ReactElement
      $$typeof: REACT_ELEMENT_TYPE,
      // 内置属性赋值
      type: type,
      key: key,
      ref: ref,
      props: props,
      // 记录创造该元素的组件
      _owner: owner,
    };
    // 
    if (__DEV__) {
      // 这里是一些针对 __DEV__ 环境下的处理，对于大家理解主要逻辑意义不大，
      // 故省略掉，以免混淆视听
    }
    return element;
};
