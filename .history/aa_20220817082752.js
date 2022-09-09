function all (arr){
    let result = []
    let index = 0
    return new Promise((resolve, reject)=>{
        arr.forEach((item, i)=>{
            if(item instanceof Promise){
                item.then(value=>{
                    result[i] = value
                    index++
                    if(index === arr.length){
                        resolve(result)
                    }
                },error=>{
                    reject(error)
                })
            }
        })
    })
}