function arrayToTree(arr){
    const result = []

    const obj = {}
    arr.forEach(item=>{
        obj[item.id] = {...item, children: []}
    })

    for(const item of arr){
       if(!obj[item.pid]){
         result.push(obj[item.id])
       }else{
        obj[item.pid].children.push(obj[item.id])
       }
    }

    return result
}