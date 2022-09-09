const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

const resolvePromise = (promise2, x, resolve, reject) => {
  if (promise2 === x) {
    reject(new TypeError('promise的循环调用'))
    return
  }
  if (x instanceof MyPromise) {
    let used; // 调用一次
    x.then(value=>{
      if(used) return;
      used = true;
      resolve(value)
    }, reason=>{
      if(used) return;
      used = true;
      reject(reason)
    })
  }else{
    resolve(x)
  }
}

class MyPromise {
  constructor (executor) {
    try {
      executor(this.resolve, this.reject)
    } catch (error) {
      this.reject(error)
    }
  }
  status = PENDING;
  value = undefined;
  reason = undefined;
  successCallback = [];
  failCallBack = []

  resolve = value => {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
      this.successCallback.forEach(fn=> fn());
    }
  }

  reject = reason => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      this.failCallBack.forEach(fn=> fn());
    }
  }

  then (successCallback, failCallBack) {
    successCallback = successCallback ? successCallback : value => value;
    failCallBack = failCallBack ? failCallBack : reason => {throw reason }
    let promise2 = new MyPromise ((resolve, reject)=>{
      if (this.status === PENDING){
        setTimeout(()=>{
          try {
            let x = successCallback(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        },0);
      } else if (this.status === FULFILLED) {
        setTimeout(()=>{
          try {
            let x = failCallBack(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        },0);
      }else {
        this.successCallback.push(()=>{
          setTimeout(()=>{
            try {
              let x = successCallback(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          },0);
        })
        this.failCallBack.push(()=>{
          setTimeout(()=>{
            try {
              let x = failCallBack(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          },0)
        })
      }
    })
    return promise2
  }

  catch (failCallBack) {
    this.then(undefined, failCallBack)
  }

  static all (array) {
    let res = []
    let index = 0
    return new MyPromise((resolve, reject)=>{
      array.forEach((item, i)=>{
        if (item instanceof MyPromise){
          item.then(value=>{
            res[i] = value;
            index++;
            if(index === array.length){
              resolve(res)
            }
          },reason=>{
            reject(reason)
          })
        }else {
          res[i] = item;
        }
      })
    })
  }
  
  static race (array) {
    return new MyPromise((resolve, reject)=>{
      array.forEach((item, i)=>{
        if (item instanceof MyPromise) {
          item.then(value=>resolve(value), reason=>reject(reason))
        }else{
          reject(item)
        }
      })
    })
  }

  static resolve (value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise(resolve => resolve(value))
  }
}