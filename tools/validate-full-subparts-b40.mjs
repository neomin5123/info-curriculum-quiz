import assert from 'node:assert/strict';
import fs from 'node:fs';
const db=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const q=new Map(db.questions.map(x=>[x.id,x]));
const a=[0,10,30,20,40,1,50,70],n=7;
function makeHeap(a,n,root){let key=a[root],child=2*root;while(child<=n){if(child<n && a[child]>a[child+1])child++;if(key<a[child])break;else{a[Math.floor(child/2)]=a[child];child*=2}}a[Math.floor(child/2)]=key}
for(let i=Math.floor(n/2);i>0;i--)makeHeap(a,n,i);
assert.equal(a[4],40);
let index=[];
for(let i=n-1;i>0;i--){const temp=a[1];a[1]=a[i+1];a[i+1]=temp;makeHeap(a,i,1);if(temp===20){index=[];for(let k=1;k<8;k++)if(a[k]===40)index.push(k)}}
assert.deepEqual(index,[2]);assert.deepEqual(a.slice(1),[70,50,40,30,20,10,1]);
const ans=q.get('2026-B-10').answer;assert.match(ans,/child < n/);assert.match(ans,/makeHeap\(list, i, 1\)/);assert.match(ans,/40/);assert.match(ans,/ⓑ 2/);
const report=JSON.parse(fs.readFileSync('data/audits/2026-10-26-build-40-os-heap-independent.json','utf8'));assert.equal(report.A_count,24);assert.equal(new Set(report.all_A_ids).size,24);assert(!report.all_A_ids.includes('2026-B-06'));
console.log('Build40 heap full subparts pass; OS retained as partial');
