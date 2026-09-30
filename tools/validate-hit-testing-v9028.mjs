import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const css=fs.readFileSync('assets/css/app.css','utf8');
const app=fs.readFileSync('js/app.js','utf8');
assert(css.includes('.retry-dock,\n.retry-dock.has-cards{\n  pointer-events:none!important;'),'dock must not intercept background clicks');
assert(css.includes('.retry-dock .retry-card-peek'),'visible retry tab must remain interactive');
assert(css.includes('.retry-dock .practical-retry-panel'),'expanded retry panel must remain interactive');
assert(app.includes("document.addEventListener('pointerdown'"),'outside-click collapse listener missing');
assert(app.includes("if(el.retryDock.contains(e.target))return"),'inside-card click containment missing');
console.log(JSON.stringify({
  status:'PASS',
  dockTransparentToPointer:true,
  visibleCardsInteractive:true,
  outsideClickCollapseRetained:true
},null,2));
