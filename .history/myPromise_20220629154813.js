
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
      if(this.status === FULFILLED){
        success(this.value)
      }
      if(this.status === REJECTED){
        failed(this.reason)
      }

      if(this.status === PENDING){
        this.success.push(()=>success(this.value))
        this.failed.push(()=>failed(this.reason))
      }
    }
}

let promise = new MyPromise(function(resolve, reject) {
    // resolve(1)
    setTimeout(()=>{
        resolve('这是异步操作执行成功后的数据')
    })

});
// console.log(promise);
promise.then(res => {
    console.log(res);
}, err => {
    console.log(err);
})

console.log(444)