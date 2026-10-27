import fs from 'node:fs';import assert from 'node:assert/strict';import vm from 'node:vm';
const app=fs.readFileSync('js/app.js','utf8');
assert.match(app,/subject-area:\$\{sub\}:\$\{a\}/);
assert.match(app,/\$\{engine.labels\[sub\]\} - \$\{a\}/);
const study=fs.readFileSync('js/core/study-engine.js','utf8');
const d=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));
const context={window:{CurriLoop:{}}};vm.runInNewContext(study,context);
const subjects=[...new Set(d.lines.map(l=>l.subject))];
for(const sub of subjects){
 const area=[...new Set(d.lines.filter(l=>l.subject===sub&&l.area!=='과목 공통').map(l=>l.area))][0];if(!area)continue;
 const scope={ui:{subject:'all',area:`subject-area:${sub}:${area}`,family:'content-system',stage:'whole'},round:1};
 const eng=context.window.CurriLoop.study.makeEngine(d,scope);
 assert(eng.groupAvailable('content-system','all',scope.ui.area));
 assert(eng.basePool().length>0);
 for(const t of eng.basePool())assert.equal(t.group.subject,sub);
}
console.log('Subject-area labels and scoped filtering PASS');
