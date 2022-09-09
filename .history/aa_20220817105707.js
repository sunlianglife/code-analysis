let aa = [1,2,3,4,5,6,7,8,9,10]
k = 3

function test(arr, k){
    aa.unshift(aa.slice(aa.length-k))
}
