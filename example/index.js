var LutherPromise = require('lutherpromise')
console.log(LutherPromise)
new LutherPromise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 2000)
  });