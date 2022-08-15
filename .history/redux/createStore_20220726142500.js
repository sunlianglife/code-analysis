
export default function createStore(reducer, initState, enhancer ) {
    if(enhancer){
        //调用 enhancer ,返回一个新强化过的 store creator
        return enhancer(createStore)(reducer, initState)
    }

    let currentReducer  = reducer // 当前的reducer
    let currentState = initState // 当前的state
    let currentListeners = [] // //当前的监听函数列表
    let nextListeners = currentListeners // 新生成的监听函数列表
    let isDispatching = false  // 是否正在执行dispatch

    // 确保 nextListeners 与 currentListeners 保持一致，且保证 nextListeners 的变化不影响当前 currentListeners
    function sameListener(){
        if(nextListeners === currentListeners){
            nextListeners = currentListeners.slice()
        }
    }

    function getState() {
        return currentState
    }

    function subscribe(listener) {
        isSubscribed = true
        // 保证 nextListeners 的变化不影响当前currentListeners
        sameListener()
        nextListeners.push(listener)
        
        return function(){
            // 防止订阅取消两次
            if(!isSubscribed)return;
            isSubscribed = false
            const index = nextListeners.indexOf(listener)
            // 删除当前绑定的订阅函数
            nextListeners.splice(index, 1)
        }
    }

    function dispatch(action) {
        if(isDispatching){
            throw new Error('reducer may not dispatch action')
        }
        try {
            isDispatching = true
            // 执行reduce函数，改变state，返回新的state对象
            currentState = currentReducer(currentState, action)
        } finally { // finally 在try 和catch后都会执行
            isDispatching = false
        }

        // state 变化是通知所有订阅函数执行
        let listeners = currentListeners = nextListeners
        listeners.forEach((fn)=>{
            fn()
        })
        return action
    }

    dispatch({})

    return {
        dispatch,
        subscribe,
        getState,
    }
}