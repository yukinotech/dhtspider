'use strict'

const dgram = require('dgram')
const Emiter = require('events')
const bencode = require('bencode')
const {Table, Node} = require('./table')
const Token = require('./token')

const bootstraps = [{
    address: 'router.bittorrent.com',
    port: 6881
}, {
    address: 'dht.transmissionbt.com',
    port: 6881
}]

function isValidPort(port) {
    return port > 0 && port < (1 << 16)
}

function generateTid() {
    return parseInt(Math.random() * 99).toString()
}

class Spider extends Emiter {
    constructor() {
        super()
        const options = arguments.length? arguments[0]: {}
        this.udp = dgram.createSocket('udp4')
        this.table = new Table(options.tableCaption || 600)
        this.bootstraps = options.bootstraps || bootstraps
        this.token = new Token()
    }

    send(message, address) {
        const data = bencode.encode(message)
        // console.log('发送1次请求')
        this.udp.send(data, 0, data.length, address.port, address.address)
    }

    findNode(id, address) {
        const message = {
            t: generateTid(),
            y: 'q',
            q: 'find_node',
            a: {
                id: id,
                target: Node.generateID()
            }
        }
        this.send(message, address)
    }

    findPeer(id,address,infoHash){
        const message = {
            t: generateTid(),
            y: 'q',
            q: 'get_peers',
            a: {
                id: id,
                info_hash: infoHash
            }
        }
        this.send(message, address)
    }

    join() {
        this.bootstraps.forEach((b) => {
            this.findNode(this.table.id, b)
        })
    }

    walk() {
        const node = this.table.shift()
        if (node) {
        	this.findNode(Node.neighbor(node.id, this.table.id), {address: node.address, port: node.port})
        }
        setTimeout(()=>this.walk(), 2)
    }

    onFoundNodes(data) {
        const nodes = Node.decodeNodes(data)
        nodes.forEach((node) => {
            if (node.id != this.table.id && isValidPort(node.port)) {
                this.table.add(node)
            }
        })
        this.emit('nodes', nodes)
    }

    onFoundPeers(data){
        console.log('found peer')
        console.log(data)
    }

    onFindNodeRequest(message, address) {
    	const {t: tid, a: {id: nid, target: infohash}} = message

        if (tid === undefined || target.length != 20 || nid.length != 20) {
            return
        }

        this.send({
            t: tid,
            y: 'r',
            r: {
                id: Node.neighbor(nid, this.table.id),
                nodes: Node.encodeNodes(this.table.first())
            }
        }, address)
    }

    onGetPeersRequest(message, address) {
        const {t: tid, a: {id: nid, info_hash: infohash}} = message

        if (tid === undefined || infohash.length != 20 || nid.length != 20) {
            return
        }

        this.send({
            t: tid,
            y: 'r',
            r: {
                id: Node.neighbor(nid, this.table.id),
                nodes: Node.encodeNodes(this.table.first()),
                token: this.token.token
            }
        }, address)

        this.emit('unensureHash', infohash.toString('hex').toUpperCase())
    }

    onAnnouncePeerRequest(message, address) {
        let {t: tid, a: {info_hash: infohash, token: token, id: id, implied_port: implied, port: port}} = message
        if (!tid) return

        if (!this.token.isValid(token)) return
       
        port = (implied != undefined && implied != 0) ? address.port : (port || 0)
        if (!isValidPort(port)) return

        this.send({ t: tid, y: 'r', r: { id: Node.neighbor(id, this.table.id) } }, address)

    	this.emit('ensureHash', infohash.toString('hex').toUpperCase(), {
            address: address.address,
            port: port
        })
    }

    onPingRequest(message, addr) {
    	this.send({ t: message.t, y: 'r', r: { id: Node.neighbor(message.a.id, this.table.id) } })
    }

    parse(data, address) {
        try {
            // console.log('parse 1 次')
            const message = bencode.decode(data)
            // console.log(message)
            if (message.y.toString() == 'r' && message.r.nodes) {
                this.onFoundNodes(message.r.nodes)
            } else if(message.y.toString() == 'r' && message.r.values){
                this.onFoundPeers(message.r.values)
            }
            else if (message.y.toString() == 'q') {
            	switch(message.q.toString()) {
            		case 'get_peers':
            		this.onGetPeersRequest(message, address)
            		break
            		case 'announce_peer':
            		this.onAnnouncePeerRequest(message, address)
            		break
            		case 'find_node':
            		this.onFindNodeRequest(message, address)
            		case 'ping':
            		this.onPingRequest(message, address)
            		break
            	}
            }
        } catch (err) {}
    }

    listen(port,hashInfo) {
        this.udp.bind(port)
        this.udp.on('listening', () => {
            console.log(`Listen on ${this.udp.address().address}:${this.udp.address().port}`)
        })
        this.udp.on('message', (data, addr) => {
            // console.log('shouData')
            this.parse(data, addr)
        })
        this.udp.on('error', (err) => {})
        // setInterval(() => this.join(), 3000)
        // this.join()
        // this.walk()
        this.startFindPeer(hashInfo)
    }

    startFindPeer(hashInfo){
        setInterval(()=>{
            console.log('bootstraps')
            bootstraps.map((address)=>{
                this.findPeer(this.table.id,address,hashInfo)
            })
        },3000)
        setInterval(()=>{
            console.log(this.table.nodes.length)
            this.table.nodes.map((node)=>{
                this.findPeer(this.table.id,{...node},hashInfo)
            })
        },3000)

    }


}

module.exports = Spider