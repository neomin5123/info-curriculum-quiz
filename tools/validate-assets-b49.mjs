import assert from 'node:assert/strict';
import fs from 'node:fs';
const build=fs.readFileSync('BUILD_ID.txt','utf8').trim();
const html=fs.readFileSync('index.html','utf8');
const tag=build.replaceAll('.','').replace(/-(\d+)$/,(_,n)=>`-${n}`);
const expected='20261027-53';
assert.equal(build,'2026.10.27-53');
const refs=[...html.matchAll(/<(?:script|link)\b[^>]*?(?:src|href)="([^"?#]+)(?:\?b=([^"#]+))?"/g)].map(x=>({path:x[1],version:x[2]}));
let count=0;
for(const x of refs){
 if(!/^(?:js\/|data\/generated\/|assets\/css\/)/.test(x.path))continue;
 assert(fs.existsSync(x.path),`asset missing: ${x.path}`);
 assert.equal(x.version,expected,`stale asset URL version for ${x.path}`);
 count++;
}
assert(count>=10,`too few versioned active assets ${count}`);
assert(html.includes(`data-build="${build}"`));
console.log(`Build50 asset revision PASS: ${count} local CSS/JS/data references match ${expected}`);
