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

    resolve = value => {
        if(this.status === PENDING) {
            this.status = FULFILLED
            this.value = value
            this.successCallback.forEach(fn=>fn())
        }
    }

    reject = reason => {
        if(this.status === PENDING) {
            this.status = REJECTED
            this.reason = reason
            this.failCallback.forEach(fn=>fn())
        }
    }

    then (successCallback, failCallback) {

    }
}
