
function fn(arr){
    for(let i = 0; i < arr.length-1; i++){
        for(let j = i+1; j < arr.length; j++){
            if(arr[i] > arr[j]){
                [arr[i], arr[j]] = [arr[j], arr[i]]
            }
        }
    }
    return arr
}

console.log(fn([3,4,1,26,10,8,7]))