let aa = [1,2,3,4,5,6,7,8,9,10]
k = 3

function test(arr, k){
    arr.unshift(...arr.splice(arr.length-k))
    return arr
}

console.log(test(aa, k))
console.log(aa)