'use strict'

const spider = new (require('./index'))

// spider.on('ensureHash', (hash, addr)=> console.log(`magnet:?xt=urn:btih:${hash}`))

// spider.on('unensureHash', (hash)=> console.log(hash))

spider.on('nodes', (nodes)=>console.log('foundNodes'))

spider.listen(6389,'3462729040a4b544f474666c56bd11db7058f2ae')