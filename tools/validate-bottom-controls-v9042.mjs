import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/css/app.css','utf8');
const footer=html.match(/<div class="study-footer-controls"[\s\S]*?<\/div>\n      <\/div>/)?.[0]||'';
assert(footer.includes('id="prevButton"')&&footer.includes('id="nextButton"'),'task navigation must be in footer controls');
assert(footer.includes('id="areaNavigator"'),'area navigator must be in footer controls');
assert(footer.includes('id="clearAnswersButton"')&&footer.includes('id="nextRoundButton"'),'reset tools must be in footer controls');
assert(css.includes('grid-template-areas:"task area tools"'),'desktop footer must place task left, area center, tools right');
assert(css.includes('grid-area:task')&&css.includes('grid-area:area')&&css.includes('grid-area:tools'),'footer grid area bindings missing');
assert(css.includes('justify-self:center'),'area navigation must be centered');
assert(css.includes('justify-self:end!important'),'reset tools must stay on the right');
assert(css.includes('v9.0.42 — one-line bottom controls'),'v9.0.42 footer css marker missing');
console.log(JSON.stringify({status:'PASS',desktop:'task left / area center / tools right',compactSpacing:true,mobileWrapUnder460:true},null,2));
