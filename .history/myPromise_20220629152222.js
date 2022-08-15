

const PENDING = 'pending'
const FULFILLED = 'fulFilled' 
const REJECTED = 'rejected'


class MyPromise {
    constructor(executer) {

        const resolve = value => {
            if(this.status === PENDING){
                this.status = FULFILLED
                this.value = value
            }
        }

        const reject = value => {
            if(this.status === PENDING){
                this.status = REJECTED
                this.reason = value
            }
        }

        try {
            executer(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }
    status = PENDING;
    value = void 0;
    reason = void 0;

    then(onFulfilled, onRejected){
        if(this.status === REJECTED){
            onRejected(this.reason)
        }
        if(this.status === FULFILLED){
            onFulfilled(this.value)
        }
    }
}