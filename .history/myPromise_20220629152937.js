
const PENDING = 'pending'
const FULFILLED = 'fulFilled' 
const REJECTED = 'rejected'

class MyPromise {
    constructor(executer) {

        const resolve = value => {
            if(this.status === PENDING){
                this.status = FULFILLED
                this.value = value
                this.success.forEach(item => {
                    item(value)
                })
            }
        }

        const reject = value => {
            if(this.status === PENDING){
                this.status = REJECTED
                this.reason = value
                this.failed.forEach(item => {
                    item(value)
                })
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
    failed  = [];
    success = []

    then(success, failed) {
        this.success.push(success)
        this.failed.push(failed)
    }
}

console.log(111)
setTimeout(()=>{
    console.log(333)
},0)
new MyPromise((resolve, reject)=>{
    console.log(444)
    resolve(555)
}).then(res=>{
    console.log(res)
})
console.log(666)