根据bep_0005规定，响应findNode的res中r的id应为
```js
 {"id" : "<queried nodes id>", "nodes" : "<compact node info>"}
```
而在你的源码中在响应其他的节点的findNode请求时，返回的不是自己节点的id
```js
onFindNodeRequest(message, address) {
  const {t: tid, a: {id: nid, target: infohash}} = message

    if (tid === undefined || target.length != 20 || nid.length != 20) {
        return
    }

    this.send({
        t: tid,
        y: 'r',
        r: {
            id: Node.neighbor(nid, this.table.id),// 这里穿的参数为何不是this.table.id
            nodes: Node.encodeNodes(this.table.first())
        }
    }, address)
}
```
根据你源码中的实现，this.table.id为你这个节点的id，Node.neighbor方法传入2个参数，取第一个参数的前6个，和第2个参数的后14位，将id重组。

请问为何这样实现，要变化返回的id？

虽然说重点信息应该是nodes字段中前8个‘有用’的node信息（ip和port）,节点的id本身并不重要。