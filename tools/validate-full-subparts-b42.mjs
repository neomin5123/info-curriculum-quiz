import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../data/audits/2026-10-26-build-42-second-chance-heap.json',import.meta.url),'utf8'));
assert.equal(d.build,'2026.10.26-42');assert.equal(d.newA,2);
let pages=[23,43,17,33,51],bits=[1,0,0,1,1],ptr=3,counts=[0,0,0,0,0];
let trace=[];
for (const ref of [73,17,51,25,23,65,23,25,51,17,89]) {
  const hit=pages.includes(ref);let victim=null,scanned=[];
  if(hit)bits[pages.indexOf(ref)]=1;
  else {while(bits[ptr]){scanned.push(ptr);bits[ptr]=0;ptr=(ptr+1)%5;}victim=ptr;pages[ptr]=ref;bits[ptr]=1;counts[ptr]++;}
  trace.push({ref,hit,scanned,replacedFrame:victim,pointer:ptr,pages:[...pages],bits:[...bits],replacementCounts:[...counts]});
}
assert.deepEqual(trace,d.items[0].trace);assert.deepEqual(d.items[0].answers.finalFrames,[[0,0,23],[1,1,89],[2,0,17],[3,0,25],[4,0,51]]);
let heap=[null],steps=[];
for(const key of [3,7,6,2,8]){heap.push(key);let k=heap.length-1;while(k>1&&key>heap[Math.floor(k/2)]){heap[k]=heap[Math.floor(k/2)];k=Math.floor(k/2);}heap[k]=key;steps.push(heap.slice(1));}
assert.deepEqual(steps,d.items[1].trace);assert.deepEqual(heap.slice(1),[8,7,6,2,3]);console.log('Build42 second chance and max heap: PASS');
