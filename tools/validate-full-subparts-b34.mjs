import assert from 'node:assert/strict';
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('data/audits/2026-10-26-build-34-reliability-ledger.json','utf8'));
assert.equal(data.new_A_ids.length,3);
assert.equal(new Set([...data.previously_reconstructable_A_ids,...data.new_A_ids]).size,14);
for(let n=0;n<16;n++) {const bits=[0,1,2,3].map(i=>(n>>i)&1);const highest=[3,2,1,0].find(i=>bits[i]);assert.equal(Number(Boolean(bits[3]||bits[2])),Number(highest!==undefined&&highest>=2));}
const X='ACGG',Y='CGCG',d=Array.from({length:5},()=>Array(5).fill(0));
for(let i=0;i<5;i++)d[i][0]=-.6*i;
for(let j=0;j<5;j++)d[0][j]=-.6*j;
for(let i=1;i<5;i++)for(let j=1;j<5;j++)d[i][j]=Math.max(d[i-1][j]-.6,d[i][j-1]-.6,d[i-1][j-1]+(X[i-1]===Y[j-1]?1:-1));
assert.ok(Math.abs(d[4][4]-1.8)<1e-8);
assert.ok(Math.abs(data.new_verifications[2].dp_matrix[4][4]-1.8)<1e-8);
console.log('Build34 independent A02/A12 and reliability ledger PASS');
