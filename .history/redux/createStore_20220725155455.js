
export default function createStore(reducer, initState, enhancer ) {
    if(enhancer){
        return enhancer(createStore)(reducer, initState)
    }

    let currentReducer  = reducer
    let currentState = initState
    let isDispatching = false 

    function getState() {
        return currentState
    }
}