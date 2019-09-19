var bencode = require('bencode')
const fs = require('fs')
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

  console.log(result2)
})

// var result = bencode.encode( data )

// console.log(result)

// var data2 = Buffer.from(``)
