import fs from 'node:fs';import vm from 'node:vm';
const root=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('js/core/study-engine.js','utf8'),ctx);
const engine=ctx.window.CurriLoop.study.makeEngine(root,{ui:{subject:'middle-info',area:'컴퓨팅 시스템',family:'content-system',stage:'whole'},round:1});
const ids=['MI-01-AC-ST-03','MI-01-AC-EX-02','MI-02-CS-PF-02','MI-02-CS-PF-03','MI-02-AC-EX-02','MI-03-CS-PF-01','MI-03-AC-EX-03','MI-04-CS-KI-02','MI-04-AC-EX-03','HI-03-AC-EX-03','HI-04-CS-KI-02'];
let ok=0;
for(const id of ids){const line=root.lines.find(l=>l.lineId===id);let result=engine.recallUnitsForLine(line,'whole');let curated=result.filter(u=>String(u.unitId).includes(':curated:'));
const expected={'MI-01-AC-ST-03':1,'MI-01-AC-EX-02':1,'MI-02-CS-PF-02':3,'MI-02-CS-PF-03':2,'MI-02-AC-EX-02':2,'MI-03-CS-PF-01':3,'MI-03-AC-EX-03':1,'MI-04-CS-KI-02':1,'MI-04-AC-EX-03':2,'HI-03-AC-EX-03':2,'HI-04-CS-KI-02':2}[id];
if(curated.length<expected)throw Error(`${id}: expected at least ${expected}, got ${curated.map(x=>x.text)}`);
for(const u of curated)if(line.sourceText.slice(u.start,u.end)!==u.text)throw Error(id+' source mismatch');
console.log(id,curated.map(x=>x.text).join(' / '));ok++;
}
console.log('Curated source-span regression PASS:',ok);
