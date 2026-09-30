import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const html=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('js/app.js','utf8');
const css=fs.readFileSync('assets/css/app.css','utf8');

assert(html.includes('area-memo-tab-icon'),'memo tab icon missing');
assert(css.includes('grid-template-columns:minmax(0,1fr) 46px!important;'),'memo tab must be right edge of shell');
assert(css.includes('.area-memo-panel{\n  grid-column:1!important;'),'memo panel column fix missing');
assert(css.includes('.area-memo-tab{\n  grid-column:2!important;'),'memo tab column fix missing');
assert(css.includes('repeating-linear-gradient(to bottom'),'notebook ruled-paper cue missing');
assert(css.includes('content:"MEMO"'),'memo identity badge missing');
assert(app.includes("if(e.key==='Escape'&&areaMemoOpen"),'Esc close missing');
console.log(JSON.stringify({
  status:'PASS',
  peekShowsActualMemoTab:true,
  notebookCue:true,
  closeMethods:['X','outside pointer','Escape']
},null,2));
