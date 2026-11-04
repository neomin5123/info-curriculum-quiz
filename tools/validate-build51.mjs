import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const src=fs.readFileSync('js/app.js','utf8');
const m=src.match(/const CLOZE46_OVERRIDES=(\{[^;]+\});/);assert(m,'override not found');
const o=JSON.parse(m[1]);
const d=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));
for(const [id,expected] of [['MI-03-AC-ST-03','다양한 알고리즘'],['HI-04-CS-KI-02','문제 해결에 적합한 데이터']]){const t=d.lines.find(x=>x.lineId===id).sourceText;const u=o[id].units[0];assert.equal(u.text,expected);assert.equal(t.slice(u.start,u.end),expected)}
assert.equal((2**(32-12))*4,4194304);assert.equal(4096/4,1024);assert.equal(Math.ceil(600/4),150);assert.equal(Math.ceil(30/4),8);
for(const n of [0,127,128,255,256])assert.equal((Math.min(n,255)>>7),n<128?0:1);
console.log('Build51 independent arithmetic and cloze offsets PASS');
