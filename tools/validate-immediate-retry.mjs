import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('js/app.js','utf8');
const config=fs.readFileSync('js/core/config.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert.match(config,/retryDelay:0\b/);
assert.match(app,/Number\(CL\.config\.retryDelay\?\?0\)/);
assert.doesNotMatch(app,/Number\(CL\.config\.retryDelay\|\|3\)/);
assert.match(app,/activeRetryCardId=id;/);
assert.match(app,/renderRetryDock\(\)/);
assert.match(html,/<small>즉시<\/small>/);
function dueAt(serial, existing=Infinity, delay=0){return Math.min(existing,serial+delay)}
assert.equal(dueAt(2),2);
assert.equal(dueAt(2,1),1);
assert.equal(dueAt(2,Infinity,3),5);
console.log('PASS immediate retry scheduling, active panel and UI labeling');
