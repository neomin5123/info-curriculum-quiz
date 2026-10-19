import fs from 'node:fs';
function assert(c,m){if(!c){console.error(m);process.exit(1);}}
const b=JSON.parse(fs.readFileSync('BUILD.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
const cfg=fs.readFileSync('js/core/config.js','utf8');
const sw=fs.readFileSync('service-worker.js','utf8');
const policy=fs.readFileSync('docs/BUILD_POLICY.md','utf8');
assert(b.buildId==='2026.10.19-15','BUILD.json id mismatch');
assert(b.publicVersion===null,'public version must be null');
assert(html.includes('<title>CurriLoop</title>'),'title must be versionless');
assert(!/v9\.1\.0 Study RC/.test(html),'public semver remains in HTML');
assert(!html.includes('class="version"'),'public version badge remains');
assert(html.includes('data-build="2026.10.19-15"'),'internal HTML build marker missing');
assert(cfg.includes("appVersion:'2026.10.19-15'"),'config build id missing');
assert(cfg.includes("storageKey:'curriloop:v9:study-state'"),'study-state compatibility key changed');
assert(sw.includes("const BUILD='2026.10.19-15'"),'service worker build id mismatch');
assert(policy.includes('YYYY.MM.DD-NN')&&policy.includes('버전 번호를 표시하지 않는다'),'build policy missing');
assert(!fs.existsSync('VERSION.json'),'legacy VERSION.json should be removed');
console.log('build policy PASS');
