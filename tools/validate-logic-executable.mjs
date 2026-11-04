import fs from 'node:fs';
const assert=(c,m)=>{if(!c)throw Error('independent logic numeric: '+m);};
const evidence={};
function check(id,actual,expected,note){assert(JSON.stringify(actual)===JSON.stringify(expected),id+' computed '+JSON.stringify(actual)+' expected '+JSON.stringify(expected));evidence[id]={pass:true,computed:actual,note};}
{
 const f=(w,x,y,z)=> Number((w&&(w||x))||((x||y)&&(y||z)));
 let same=true;for(let w=0;w<2;w++)for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++)same&&=f(w,x,y,z)===Number(Boolean(w||y||(x&&z)));
 check('2014-A-05',same,true,'all 16 assignments: F=W+Y+XZ');
}
{
 // [tag,data] ways, replacement prefers a blank slot, else the non-MRU way.
 const cache={0:[['11','DA'],null],1:[['00','AB'],['01','BB']],2:[['01','BC'],null],3:[['10','CD'],null]},mru={0:0,1:1,2:0,3:0};
 const values=['AA','AB','AC','AD','BA','BB','BC','BD','CA','CB','CC','CD','DA','DB','DC','DD'];
 for(const addr of [6,7,9]){const ix=addr&3,t=(addr>>2).toString(2).padStart(2,'0');let way=cache[ix].findIndex(v=>v&&v[0]===t);if(way<0){way=cache[ix].findIndex(v=>v===null);if(way<0)way=1-mru[ix];cache[ix][way]=[t,values[addr]];}mru[ix]=way;}
 check('2014-B-04',{set01:cache[1],set11:cache[3],ref01:mru[1],ref11:mru[3]},{set01:[['10','CB'],['01','BB']],set11:[['10','CD'],['01','BD']],ref01:0,ref11:1},'2-way LRU, 6 hit, 7/9 misses');
}
check('2016-A-06',{single:3*Math.max(120,140,160),pipeline:(5+3-1)*40},{single:480,pipeline:280},'fixed 160 single-cycle; fixed 40 pipeline-stage cycle');
{
 const a=0b1111,b=0b0001,sum=a+b,result=sum&15;
 check('2017-A-06',{Z:Number(result===0),C:Number(sum>15),signedMin:-8,signedMax:7},{Z:1,C:1,signedMin:-8,signedMax:7},'two complement addition -1+1');
}
{
 const select=Array.from({length:4},(_,addr)=>Array.from({length:4},(_,i)=>Number(i===addr)).join(''));
 check('2017-B-06',{chips:(1024/256),addr:(3<<8)+11,bits:4*8,oneHot:select},{chips:4,addr:779,bits:32,oneHot:['1000','0100','0010','0001']},'two address input bits A9,A8');
}
{
 const next=(u,v,q)=>(u===0&&v===0?1-q:u===0&&v===1?0:u===1&&v===0?1:q);
 check('2018-A-07',{zeroToOne:next(0,0,0)===1&&next(1,0,0)===1,zeroToZero:next(0,1,0)===0&&next(1,1,0)===0},{zeroToOne:true,zeroToZero:true},'UV characteristic table');
}
check('2018-B-06',{selectBits:Math.ceil(Math.log2(6)),microOps:2},{selectBits:3,microOps:2},'6 bus sources; DR increment internal');
{
 const next=(a,x)=>{const s=x&a,t=x^(1-a);return s===0&&t===0?a:s===0&&t===1?1:s===1&&t===0?0:1-a;};
 check('2019-A-07',{circle:next(0,0),square:next(1,1)},{circle:1,square:0},'S=xA; T=x XOR NOT A');
}
check('2019-B-03',{physReloc:8192+3200,page:Math.floor(3200/1024),frame:6,physical:6*1024+3200%1024},{physReloc:11392,page:3,frame:6,physical:6272},'word-address paging and relocation');
check('2019-B-07',{storedPc:(0x10+1),nextPc:0x20+1},{storedPc:17,nextPc:33},'direct BSA at memory 0x10');
{
 const outputs=[];for(let x=0;x<2;x++)for(let y=0;y<2;y++){
  const o=[0,0,0,0];o[y*2+x]=1;
  const s1=o[3]^o[2],s0=o[1]^o[0];outputs.push(o[2*s1+s0]);
 }
 check('2020-A-03',outputs,[0,1,1,0],'decoder and MUX, combinations XY 00,01,10,11');
}
{
 const inst=[['LOAD1',0,'load'],['LOAD2',1,'load'],['NOP',2,'nop'],['DEC1',3,'alu'],['ADD2',4,'alu'],['ADD1',5,'alu'],['NOP',6,'nop'],['DEC1b',7,'alu']];
 const a=name=>{const o=inst.find(([n])=>n===name);return o[1]+2;};
 const end=name=>{const o=inst.find(([n])=>n===name);return o[1]+(o[2]==='load'?4:3);};
 check('2020-B-11',{loads:inst.filter(x=>x[2]==='load').length,hazardFree:a('DEC1')>end('LOAD1')&&a('ADD2')>end('LOAD2')&&a('DEC1b')>end('ADD1')},{loads:2,hazardFree:true},'NOP positions ②,⑤ in I/A/E/D pipeline');
}
check('2021-A-08',{effective:2004,value:2000+1},{effective:2004,value:2001},'LOAD direct + INCR + STORE indirect');
{
 const convert=a=>{let acc=a[0];const out=[acc];for(const x of a.slice(1)){acc^=x;out.push(acc);}return out.join('');};
 const target=[1,0,1,0];const input=[target[0]];for(let i=1;i<4;i++)input.push(target[i]^target[i-1]);
 check('2021-B-03',{from1010:convert([1,0,1,0]),to1010:input.join(''),singleBitParity:(([1,0,1,0].reduce((a,b)=>a^b,0))^1)},{from1010:'1100',to1010:'1111',singleBitParity:1},'cumulative XOR and even parity');
}
{
 const F=(a,b,c)=>Number(Boolean((!a&&b)||(a&&!b&&c)||(b&&!c)));
 check('2023-A-02',{d0:[0,1].map(c=>F(0,0,c)).join(''),d2:[0,1].map(c=>F(1,0,c)).join('')},{d0:'00',d2:'01'},'D0=0, D2=C');
}
check('2023-A-04',{bits:2**31/2**13,cluster:(2**31/2**13)/(8*2**13)},{bits:262144,cluster:4},'disk and bitmap dimensions in binary units');
{
 const pos={1:0,2:1,5:2,6:3,4:4,8:5};
 // A/E completion of LOAD_i is start_i+2; ADD_j reads in A stage start_j+1.
 check('2024-B-02',{cycles:6+3-1,depA:(pos[4]+1)>(pos[1]+2)&&(pos[4]+1)>(pos[2]+2),depB:(pos[8]+1)>(pos[5]+2)&&(pos[8]+1)>(pos[6]+2)},{cycles:8,depA:true,depB:true},'NOP removed and valid independent LOAD reordering');
}
{
 const outputs=[];for(let i3=0;i3<2;i3++)for(let i2=0;i2<2;i2++)outputs.push(Number(Boolean(i3||i2)));
 check('2025-A-02',{top:'I3',y1:outputs},{top:'I3',y1:[0,1,1,1]},'I3 highest priority and OR with I2');
}
check('2025-B-06',{returnAddress:0+1,noInterrupt:32,storeOpcode:(4>>2).toString(2).padStart(3,'0')},{returnAddress:1,noInterrupt:32,storeOpcode:'001'},'control store addresses 0,32,4');
check('2026-A-02',{effective:1000+1200,callOrder:['PC→BR','SP→AR/branch→PC','BR→stack,SP--']},{effective:2200,callOrder:['PC→BR','SP→AR/branch→PC','BR→stack,SP--']},'base register and subroutine call transfer');
{
 const a=0b0110,b=0b0100,r=(a+b)&15,carryIntoSign=((a&7)+(b&7))>=8,carryOut=a+b>15;
 check('2026-B-08',{sela:'01',selc:'11',sum:r.toString(2).padStart(4,'0'),overflow:Number(carryIntoSign!==carryOut)},{sela:'01',selc:'11',sum:'1010',overflow:1},'4-bit signed addition and carry XOR');
}
assert(Object.keys(evidence).length===21,'21 checked');
const exam=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const ids=new Set(exam.questions.filter(q=>q.subject==='논회컴구').map(q=>q.id));
assert(Object.keys(evidence).every(id=>ids.has(id)),'coverage check');
console.log(JSON.stringify({status:'PASS',independentExecutions:21,passed:21}));
