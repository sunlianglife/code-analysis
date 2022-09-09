function fn(arr){
    const result = []
    const obj = {}
    obj.forEach(item=>{
        obj[item.id] = {...item, children: []}
    })

    arr.forEach(item=>{
        const id = item.id
        const pid = item.pid
        const treeItem = obj[id]
        if(!obj[pid]){
            result.push(treeItem)
        }else{
            obj[pid].children.push(treeItem)
        }
    })

    return result
}