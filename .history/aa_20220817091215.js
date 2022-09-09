const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise{
    constructor(executor){
        try {
            executor(this.resolve, this.reject)
        } catch (error) {
            this.reject(error)
        }
    }
    status = PENDING
    value = undefined
    reason = undefined
    successCallback = []
    failCallback = []
}
