
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

console.log(111)
setTimeout(()=>{
    console.log(333)
},0)
new Promise((resolve, reject)=>{
    console.log(444)
    resolve(555)
}).then(res=>{
    console.log(res)
})
console.log(666)