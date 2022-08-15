// import { combineReducers } from "redux";

/**
 * reducer组合
 * @param {*} reducers 是一个对象，key的值和state的key值一样，value是一个reducer函数
 * 
 * 返回一个组合之后的reducer函数
 */

export default function combineReducers(reducers) {
    // 过滤掉value值不是reducer函数的值
    let finalReducers = {}
    for(let i in reducers){
        if(typeof reducers[i] === 'function'){
            finalReducers[i] = reducers[i]
        }
    }

    // 返回一个合成的reducer函数，参数接受state和action
    return function(state, action){
        let hasChange = false // state是否改变
        let nextState = {} // 此reducer函数执行之后的state

        // 循环执行reducers
        for(let i in finalReducers){
            let reducer = finalReducers[i] // 当前reducer函数
            let currentKeyState = state(i) // 当前state里面当前key对应的值
            let currentKeyNextState = reducer(currentKeyState, action) // 在reducer函数执行之后返回新的key对应的值
            nextState[i] = currentKeyNextState // 新的值添加到新的state上面去
            hasChange = hasChange || currentKeyState !== currentKeyNextState // 判断前后的值是否改变
        }
        return hasChange ? nextState : state  // state改变了则返回新的state，否则返回老的state
    } 
}