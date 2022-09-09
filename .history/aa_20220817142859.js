function arrayToTree(arr){
    const result = []
    const itemMap = {}
    arr.forEach(item=>{
        itemMap[item.id] = {...item, children: []}
    })

    for(const item of arr){
        const id = item.id
        const pid = item.pid
        const value = itemMap[id]
        if(!itemMap[pid]){
            result.push(value)
        }else{
            itemMap[pid].children.push(value)
        }
    }

    return result
}