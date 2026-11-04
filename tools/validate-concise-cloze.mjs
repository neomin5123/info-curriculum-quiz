import fs from 'node:fs';
import vm from 'node:vm';
const root=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));
const context={window:{}};
vm.runInNewContext(fs.readFileSync('js/core/study-engine.js','utf8'),context);
const state={ui:{subject:'high-info',area:'컴퓨팅 시스템',family:'content-system',stage:'practical'},round:1};
const engine=context.window.CurriLoop.study.makeEngine(root,state);
const line=root.lines.find(l=>l.lineId==='HI-01-CS-KI-02');
const target=line.presentation.units.find(u=>u.text.startsWith('컴퓨팅 시스템 간 연결'));
const result=engine.keywordsForSet(line,line.presentation.coreSets.find(s=>s.unitIds.includes(target.unitId)));
if(result.map(x=>x.text).join('|')!=='컴퓨팅 시스템|통신')throw Error('overlong target not split into precise terms');
for(const term of result){if(line.sourceText.slice(term.start,term.end)!==term.text)throw Error('not source faithful');}
const rawHasLong=line.presentation.units.some(u=>u.text===target.text);
if(!rawHasLong)throw Error('original training data unexpectedly mutated');
console.log('concise cloze PASS',JSON.stringify(result.map(x=>x.text)));
