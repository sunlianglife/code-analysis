
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

    function getState() {
        return currentState
    }

    function subScribe() {

    }

    function dispatch(action) {
        try {
            isDispatching = true
            // 执行reduce函数，改变state，返回新的state对象
            currentState = currentReducer(currentState, action)
        } finally { // finally 在try 和catch后都会执行
            isDispatching = false
        }

        let listeners = currentListeners = nextListeners
        
    }
}