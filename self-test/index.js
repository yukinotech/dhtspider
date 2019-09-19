'use strict'

const dgram = require('dgram')
const Emiter = require('events')
const bencode = require('bencode')
const crypto = require('crypto')

const bootstraps = [{
    host: 'router.bittorrent.com',
    port: 6881
}, {
    host: 'dht.transmissionbt.com',
    port: 6881
}]

let udpServer = dgram.createSocket('udp4')

udpServer.on('error', (err) => {
  console.log(`服务器异常：\n${err.stack}`);
  server.close();
});

udpServer.on('message', (msg, rinfo) => {
  console.log(bencode.decode(msg))
  // console.log(`服务器接收到来自 ${rinfo.address}:${rinfo.port} 的 ${msg}`);
  
});

udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`服务器监听 ${address.address}:${address.port}`);
});

udpServer.bind(6389);

let send = function(message,address){
  let data = bencode.encode(message)
  udpServer.send(data,address.port,address.host,(err)=>{
    console.log(address.port,address.host,'发送1次')
  })
}

let generateId = function(){
  return crypto.createHash('sha1').update(`${(new Date).getTime()}:${Math.random()*99999}`).digest()
}

function generateTid() {
  return parseInt(Math.random() * 99).toString()
}

const selfId = generateId()

setInterval(function(){
  for(let address of bootstraps){
    try{
      let message = {
        t: 'aa',
        y: 'q',
        q:'ping',
        a:{
          id:selfId,
          // target:generateId()
        }
      }
      send(message,address)
    }catch(e){
      console.log(e)
    }
  }
},3000)