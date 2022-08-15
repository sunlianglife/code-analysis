
enum Status {
    PENDING = 'pending', // 等待中
    FULFILLED = 'fulfilled', // 执行
    REJECTED = 'rejected', // 拒绝
  }
  class MyPromise {
    /** 执行状态 */
    state: Status = Status.PENDING;
    /** 执行返回 */
    value: any = null;
    /** 失败返回 */
    reason: any = null;
    /** 成功存放的数组 */
    onResolvedCallbacks: Function[] = [];
    /** 失败存放法数组 */
    onRejectedCallbacks: Function[] = [];
    /** 构造方法 是一个方法，里面有2个传参，第一个是 resolve 是方法传参是 成功回调传参， 第二个是reject方法 里面的参数是失败回调 */
    public constructor(
      fn: (resolve: (value: unknown) => void, reject: (reason: unknown) => void) => void,
    ) {
      const resolve = (value: unknown) => {
        // state改变,resolve调用就会失败
        if (this.state === Status.PENDING) {
          // resolve调用后，state转化为成功态
          this.state = Status.FULFILLED;
          // 储存成功的值
          this.value = value;
          // 一旦resolve执行，调用成功数组的函数
          this.onResolvedCallbacks.forEach((fn) => fn());
        }
      };
      const reject = (reason: unknown) => {
        // state改变,reject调用就会失败
        if (this.state === Status.PENDING) {
          // reject调用后，state转化为失败态
          this.state = Status.REJECTED;
          // 储存失败的原因
          this.reason = reason;
          // 一旦reject执行，调用失败数组的函数
          this.onRejectedCallbacks.forEach((fn) => fn());
        }
      };
      // 如果executor执行报错，直接执行reject
      try {
        fn(resolve, reject);
      } catch (err) {
        reject(err);
      }
    }
  
    // then 方法 有两个参数onFulfilled 是指 then(res)的res  res 就是 resolve()传进去的值 onRejected
    then(onFulfilled?: Function, onRejected?: Function) {
      // 声明返回的promise2
      const promise2 = new MyPromise((resolve, reject) => {
        if (this.state === Status.FULFILLED && onFulfilled) {
          const x = onFulfilled(this.value);
          this.resolvePromise(promise2, x, resolve, reject);
        }
        if (this.state === Status.REJECTED && onRejected) {
          const x = onRejected(this.reason);
          this.resolvePromise(promise2, x, resolve, reject);
        }
        // 当状态state为pending时
        if (this.state === Status.PENDING) {
          if (onFulfilled && typeof onFulfilled === 'function') {
            // onFulfilled传入到成功数组
            this.onResolvedCallbacks.push(() => {
              const x = onFulfilled(this.value);
              this.resolvePromise(promise2, x, resolve, reject);
            });
          }
  
          if (onRejected && typeof onRejected === 'function') {
            // onRejected传入到失败数组
            this.onRejectedCallbacks.push(() => {
              const x = onRejected(this.value);
              this.resolvePromise(promise2, x, resolve, reject);
            });
          }
        }
      });
      return promise2;
    }
  
    resolvePromise(
      promise2: MyPromise,
      x: any,
      resolve: (value: unknown) => void,
      reject: (value: unknown) => void,
    ) {
      if (promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise #<promise>'));
      }
      // 判断如果x是否是一个对象，判断函数是否是对象的方法有：typeof instanceof constructor toString
      if ((typeof x === 'object' && x != null) || typeof x === 'function') {
        try {
          const then = x.then; // 取then可以报错，报错就走reject()
          if (typeof then === 'function') {
            // 用then.call()为了避免在使用一次x.then报错
            then.call(
              x,
              (y: any) => {
                console.log('y', y);
                resolve(y); // 采用promise的成功结果，并且向下传递
              },
              (r: any) => {
                reject(r); // 采用promise的失败结果，并且向下传递
              },
            );
          } else {
            resolve(x); // x不是一个函数，是一个对象
          }
        } catch (err) {
          reject(err);
        }
      } else {
        // x是一个普通值
        resolve(x);
      }
    }
  }
  