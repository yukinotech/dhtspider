'use strict'

const dgram = require('dgram')
const Emiter = require('events')
const bencode = require('bencode')
const crypto = require('crypto')

const bootstraps = [{
    address: 'router.bittorrent.com',
    port: 6881
}, {
    address: 'dht.transmissionbt.com',
    port: 6881
}]

let udpServer = dgram.createSocket('udp4')

udpServer.on('error', (err) => {
  console.log(`服务器异常：\n${err.stack}`);
  server.close();
});

udpServer.on('message', (msg, rinfo) => {
  console.log(`服务器接收到来自 ${rinfo.address}:${rinfo.port} 的 ${msg}`);
});

udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`服务器监听 ${address.address}:${address.port}`);
});

udpServer.bind(6339);

let send = function(message,address){
  let data = bencode.encode(message)
  udpServer.send(data,address.port,address.host,(err)=>{
    // console.log('发送1次请求')
  })
}

let generateId = function(){
  return crypto.createHash('sha1').update(`${(new Date).getTime()}:${Math.random()*99999}`).digest()
}
setInterval(function(){
  for(let address of bootstraps){
    let message = {
      q:'find_node',
      a:{
        id:generateId(),
        target:generateId()
      }
    }
    send(message,address)
  }
},2000)