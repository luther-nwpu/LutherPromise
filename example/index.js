var LutherPromise = require('../src/lutherpromise')
new LutherPromise((resolve, reject) => {
    setTimeout(() => {
      console.log('666666666666666666')
      resolve(1)
    }, 2000)
  }).then(result => {  //this should append to the new LutherPromise.
      console.log('first top layer .then ', result)
      return result + 1
    //note that the final .then is called once the prior LutherPromise chain actually completes.
  }).then(result => {
    console.log('second top layer .then ', result)
    //if we return a new LutherPromise here.... p will get set
    return new LutherPromise((resolve, reject) => {
      resolve(result+1)
    })
  }).then(result => {
    console.log('LutherPromise ', result)
    return new LutherPromise((resolve, reject) => {
      setTimeout(() => {
        console.log('resolving third top layer ' + result)
        resolve(result+1)
      }, 1000)
    }).then().then(t => {
      console.log('inner LutherPromise ' + t)
      return t
    })
  }).then(result => {
    console.log('final: ', result)
  })