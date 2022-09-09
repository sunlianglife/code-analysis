const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

const resolvePromise = (promise2, x, resolve, reject) => {
    if(promise2 === x){
        reject(new TypeError('循环引用'))
    }
    if(x instanceof MyPromise){
        x.then(value=>resolve(value), error=>reject(error))
    }else{
        resolve(x)
    }
} 

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
        successCallback = successCallback ? successCallback : value => value
        failCallback = failCallback ? failCallback : reason => {throw reason}
        let promise2 = new Premise((resolve, reject)=>{
            if(this.status === FULFILLED){
                setTimeout(()=>{
                    try{
                        let x = successCallback(this.value)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch(error){
                        reject(error)
                    }
                },0)
            }else if(this.status === REJECTED){
                setTimeout(()=>{
                    try{
                        let x = failCallback(this.reason)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch(error){
                        reject(error)
                    }
                },0)
            }else{
                this.successCallback.push(()=>{
                    setTimeout(()=>{
                        try{
                           let x = successCallback(this.value)
                           resolvePromise(promise2, x, resolve, reject)
                        }catch(error){
                            reject(error)
                        }
                    }, 0)
                })
                this.failCallback.push(()=>{
                    setTimeout(()=>{
                        try{
                           let x = failCallback(this.value)
                           resolvePromise(promise2, x, resolve, reject)
                        }catch(error){
                            reject(error)
                        }
                    }, 0)
                })
            }
        })
    }
}
