class LRU{
    constructor(maxSize = 10){
        this.maxSize = maxSize
        this.hash = new Map()
    }

    get(key){
        if(this.hash.has(key)){
            let value = this.hash.get(key)
            this.hash.delete(key)
            this.hash.set(key, value)
            return value
        }
        return undefined
    }

    set(key, value){
        if(this.hash.has(key)){
            this.hash.delete(key)
        }
        this.hash.set(key, value)

        if(this.hash.size() > this.maxSize){
            this.hash.delete(this.hash.keys().next().value)
        }
    }
}