import { combineReducers, createStore, applyMiddleware } from 'redux'
import thunk from "redux-thunk"; // 处理异步action的中间件


// reducer声明
// 创建单独的reducer文件声明，导出使用
const todos = (state = [], action) => {
    switch (action.type) {
      case 'ADD_TODO':
        return [
          ...state,
          ...action.data
        ]
      default:
        return state
    }
}

const visibilityFilter = (state = 'SHOW_ALL', action) => {
    switch (action.type) {
      case 'SET_VISIBILITY_FILTER':
        return action.filter
      default:
        return state
    }
}

// 多个reducer组合
const todoApp = combineReducers({
    stateA: todos,
    stateB: visibilityFilter
})


// 创建store对象
let store = createStore(todoApp, applyMiddleware(thunk))


// 定义action  单独创建文件定义多个，导出方法使用
const addTodo = (data) => {
    // 在此处可以对数据进行再次封装
    // 此处可以进项异步操作，前提是加入了支持异步操作的中间件 例如： redux-thunk
    return {
      type: 'ADD_TODO',
      data,
    }
}

// dispatch
store.dispatch(addTodo({
    id: 22,
    name: 33
}))
