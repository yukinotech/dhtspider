let hashInfo = '3462729040a4b544f474666c56bd11db7058f2ae'

console.log(hashInfo.length/2)

let buf = Buffer.alloc(20);
for(let i=0;i<hashInfo.length;i=i+2){
  let number = parseInt("0x"+hashInfo[i]+hashInfo[i+1])
  // console.log(number)
  buf.writeUInt8(number,i/2)
}
console.log(buf)
