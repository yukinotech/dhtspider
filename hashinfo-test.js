
const crypto = require('crypto');
const hash = crypto.createHash('sha1');

let obj={
  name:11,
  age:11
}
console.log(hash.update(Buffer.from(obj)).digest('hex'))
