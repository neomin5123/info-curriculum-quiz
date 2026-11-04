import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8'),js=fs.readFileSync('js/app.js','utf8'),css=fs.readFileSync('assets/css/app.css','utf8');
const ids=['areaNavigatorNearStudy','prevAreaButtonNearStudy','currentAreaLabelNearStudy','nextAreaButtonNearStudy'];
for(const id of ids){ assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,`id ${id} must appear once`);assert(js.includes("$('"+id+"')"),`js binding ${id}`); }
assert(html.indexOf('id="areaNavigatorNearStudy"')>html.indexOf('id="studyControlBody"'));
assert(html.indexOf('id="areaNavigatorNearStudy"')<html.indexOf('id="studyCard"'));
assert(js.includes("el.areaNavNear.hidden=true"),'hide both navigators on empty queue');
assert(js.includes("el.prevAreaNear?.addEventListener('click',()=>jumpArea(-1))"));
assert(js.includes("el.nextAreaNear?.addEventListener('click',()=>jumpArea(1))"));
assert(js.includes('for(const view of ['),'both navigators must receive identical state');
assert(css.includes('#studyPage > .area-navigator-near-study'));
console.log('Near-study navigator integrity PASS');
