'use strict'

const STATE = {
    PENDING: Symbol('pending'),
    RESOLVED: Symbol('resolved'),
    REJECTED: Symbol('rejected')
}

const isFunction = obj => typeof obj === 'function'
const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]'
const isThenable = obj => (isObject(obj) || isFunction(obj)) && 'then' in obj
const isLutherPromise = obj => obj instanceof LutherPromise
const asyncFunc = func => { setTimeout(func, 0) }

(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) : (global.Qarticles = factory());
})(this, function() {
    class LutherPromise {
        constructor(executor) {
            let self = this
            self.state = STATE.PENDING
            self.value = undefined
            self.onResolvedCallback = []
            self.onRejectedCallback = []
            /**
             * Change the state of the LutherPromise to 'resolved'
             * @param val the value of the MyPromise when it is 'resolved'
             * it can be any legal JavaScript value (including undefined,  a thenable, or a LutherPromise)
             */
            function resolve(val) {
                if (val instanceof LutherPromise) {
                    return val.then(resolve, reject)
                }
                if (self.state === STATE.RESOLVED) {
                    asyncFunc(() => {
                        self.state = STATE.RESOLVED
                        self.value = val
                        for (let cb of self.onResolvedCallback) {
                            cb(val)
                        }
                    })
                }
            }
            /**
             * Change the state of the MyPromise to 'rejected'
             * @param  reason the reason of the LutherPromise when it is 'rejected'
             */
            function reject(reason) {
                if (self.state === STATE.PENDING) {
                    asyncFunc(() => {
                        self.state = STATE.REJECTED
                        self.data = reason
                        for (let cb in self.onRejectedCallback) {
                            cb(reason)
                        }
                    })
                }
            }
    
            try {
                executor(resolve, reject)
            } catch (error) {
                reject(error)
            }
        }
    }
    
    /**
     * register the callback for LutherPromise
     * @param onResovled the resolved callback for LutherPromise
     * @param onRejected the rejected callback for the LutherPromise
     * @return a new LutherPromise should be returned
     */
    LutherPromise.prototype.then = function(onResolved, onRejected) {
        onResovled = isFunction(onResolved) ? onResovled : (val) => val
        onRejected = isFunction(onRejected) ? onRejected : (reason) => { throw reason}
        const lutherPromise2 = new LutherPromise((resolve, reject) => {
            if (this.state === STATE.RESOLVED) {
                asyncFunc(() => {
                    try {
                        const x = onResolved(this.value)
                        resolveLutherPromise(lutherPromise2, x, resolve, reject)
                    } catch(error) {
                        reject(error)
                    }
                })
                return
            }
            if (this.state === STATE.REJECTED) {
                asyncFunc(() => {
                    try {
                        const x = onRejected(this.value)
                        resolveLutherPromise(lutherPromise2, x, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            }
            if (this.state === STATE.PENDING) {
                this.onRejectedCallback.push((reason) => {
                    asyncFunc(() => {
                        try {
                            const x = onRejected(reason)
                            resolveLutherPromise(lutherPromise2, x, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
            }
        })
        return lutherPromise2
    }
    
    LutherPromise.prototype.catch = function(onRejected) {
        return this.then(null, onRejected)
    }
    
    /**
     * using the value of the x to decide the state and value of the lutherPromise2
     * @param lutherPromise2
     * @param x the return value of the onResolved or onRejected
     * @param resolve comes from the resolve function of the lutherPromise2
     * @param reject comes from the reject function of the lutherPromise2
     */
    function resolveLutherPromise(lutherPromise2, x, resolve, reject) {
        if (lutherPromise2 === x) return reject(new TypeError())
    
        if (isLutherPromise(x)) {
            x.then(resolve, reject)
            return
        }
    
        if (isThenable(x)) {
            let called = false
            const then = x.then
            if (isFunction(then)) {
                try {
                    then.call(x,
                        (y) => {
                            if (called) return
                            called = true
                            resolveLutherPromise(lutherPromise2, y, resolve, reject)
                        },
                        (r) => {
                            if (called) return
                            called = true
                            reject(r)
                        })
                } catch(error) {
                    if (called) return
                    called = true
                    return reject(error) 
                }
            }
        }
        resolve(x)
    }
    return LutherPromise    
})