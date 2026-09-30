import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const css=fs.readFileSync('assets/css/app.css','utf8');
const app=fs.readFileSync('js/app.js','utf8');

assert(app.includes("group-input-row ${mode==='typing'?'copy-mode':''}"),'copy-mode class missing from generic typing rows');
assert(css.includes('.cs-input-item.cs-typing-item{'),'content-system typing override missing');
assert(css.includes('grid-template-columns:minmax(240px,.95fr) minmax(280px,1.05fr) 82px!important;'),'desktop typing columns not protected');
assert(css.includes('.group-input-row.copy-mode{'),'generic typing override missing');
assert(css.includes('word-break:keep-all;'),'Korean source wrapping guard missing');

const lastGeneric=css.lastIndexOf('.cs-input-item{grid-template-columns:25px minmax(0,1fr) 82px}');
const finalTyping=css.lastIndexOf('.cs-input-item.cs-typing-item{');
assert(finalTyping>lastGeneric,'typing override must appear after generic cs-input-item column rule');

console.log(JSON.stringify({
  status:'PASS',
  rootCause:'later generic .cs-input-item grid rule overrode .cs-typing-item columns',
  typingOverrideAfterGeneric:true,
  genericCopyModeProtected:true
},null,2));
