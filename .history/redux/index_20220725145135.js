import { combineReducers, createStore, applyMiddleware } from 'redux'
import thunk from "redux-thunk"; // 处理异步action的中间件


// reducer声明
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
}, applyMiddleware(thunk))


// 创建store对象
let store = createStore(todoApp)


// 定义action
const addTodo = (data) => {
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
