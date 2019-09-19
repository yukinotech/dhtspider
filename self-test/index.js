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
  let res = bencode.decode(msg)
  if(res && res.r && res.r.nodes){
    let data = res.r.nodes
    const nodes = []
		for (let i = 0; i + 26 <= data.length; i += 26) {
			nodes.push({
				id: data.slice(i, i + 20),
				address: `${data[i + 20]}.${data[i + 21]}.${data[i + 22]}.${data[i + 23]}`,
				port: data.readUInt16BE(i + 24)
			})
			console.log({
				id: data.slice(i, i + 20),
				address: `${data[i + 20]}.${data[i + 21]}.${data[i + 22]}.${data[i + 23]}`,
				port: data.readUInt16BE(i + 24)
			})
		}
		return nodes
  }
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
        q:'find_node',
        a:{
          id:selfId,
          target:generateId()
        }
      }
      send(message,address)
    }catch(e){
      console.log(e)
    }
  }
},3000)