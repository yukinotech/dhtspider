const crypto = require('crypto')

let generateId = function(){
  return crypto.createHash('sha1').update(`${(new Date).getTime()}:${Math.random()*99999}`).digest()
}

console.log(Buffer.concat([generateId().slice(0, 6), generateId().slice(6)]))
Buffer.concat([generateId().slice(0, 6), generateId().slice(6)])