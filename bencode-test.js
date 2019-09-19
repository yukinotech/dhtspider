var bencode = require('bencode')
const fs = require('fs')
const crypto = require('crypto');
const hash = crypto.createHash('sha1');
// var data = {
//   kry: 'Hello World',
//   // integer: 12345,
//   // dict: {
//   //   key: 'This is a string within a dictionary'
//   // },
//   // list: [ 1, 2, 3, 4, 'string', 5, {} ]
// }

fs.readFile('./test-kamigami.torrent', (err, data) => {
  var result2 = bencode.decode(data)
  let infoBuffer = bencode.encode(result2.info)
  // console.log(infoBuffer)
  // console.log(hash.update(infoBuffer).digest())
  console.log(hash.update(infoBuffer).digest('hex'))
  console.log(result2.info)
})

// var result = bencode.encode( data )

// console.log(result)

// var data2 = Buffer.from(``)
