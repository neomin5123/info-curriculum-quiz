import fs from 'node:fs';
import vm from 'node:vm';
function assert(ok,msg){if(!ok)throw new Error(msg)}
const read=(p)=>fs.readFileSync(p,'utf8');
const ai=JSON.parse(read('data/curriculum/ai-basic-2022.json'));
const old=JSON.parse(read('data/curriculum/middle-high-v9.0.6.json'));
const q=JSON.parse(read('data/exams/major-exams-2014-2026.json'));
const bounds=JSON.parse(read('data/generated/exam-display-bounds.json')).bounds;
const ctx={window:{}};
vm.runInNewContext(read('data/generated/ai-basic-data.js'),ctx);
assert(JSON.stringify(ai)===JSON.stringify(ctx.window.CURRILOOP_AI_BASIC_DATA),'AI generated mirror mismatch');
assert(old.lines.length===270,'legacy curriculum count changed');
assert(old.lines.reduce((n,l)=>n+(l.presentation?.units?.length||0),0)===370,'legacy presentation units changed');
assert(ai.lines.length===110,'AI data line count mismatch');
assert(ai.knowledgeUnderstandingGroups.length===4,'AI knowledge groups missing');
assert(new Set(ai.lines.map(x=>x.lineId)).size===ai.lines.length,'AI line id duplicate');
assert([...new Set(ai.lines.filter(l=>l.area!=='과목 공통').map(l=>l.area))].length===4,'AI areas not four');
const standards=ai.lines.filter(l=>l.family==='성취기준');
assert(standards.length===19,'AI standard count should be 19');
for(const l of ai.lines){
 assert(l.subject==='ai-basic'&&l.subjectLabel==='인공지능 기초','wrong AI subject');
 assert(l.sourceText.length>=4,'empty official text');
 for(const k of l.keywords||[]){assert(l.sourceText.slice(k.start,k.end)===k.text,'incorrect AI keyword offset '+l.lineId)}
 for(const u of l.presentation?.units||[]){assert(l.sourceText.slice(u.start,u.end)===u.text,'incorrect AI phrase offset '+l.lineId)}
}
const ids=new Set(q.questions.map(x=>x.id));
let trimmed=0;
for(const [qid,b] of Object.entries(bounds)){
 assert(ids.has(qid),'unknown question ID '+qid);
 const quest=q.questions.find(x=>x.id===qid);
 for(const [ix,newHeight] of Object.entries(b)){
  const img=quest.images[Number(ix)];
  assert(img&&img.atlas&&Number.isInteger(newHeight)&&newHeight>=120&&newHeight<=img.height,'invalid display bound '+qid);
  trimmed++;
 }
}
assert(trimmed===181,'trim count mismatch '+trimmed);
const html=read('index.html'),app=read('js/app.js'),engine=read('js/core/study-engine.js');
assert(html.includes('ai-basic-data.js')&&html.includes('exam-display-bounds.js'),'missing supplemental load');
assert(app.includes('AI_DATA.lines')&&app.includes('areasForSubject')&&engine.includes('function areasForSubject'),'AI runtime integration missing');
assert(app.includes('${displayHeight}')&&html.includes('id="stageSelect" hidden'),'display trim and whole-only UI missing');
console.log(JSON.stringify({status:'PASS',legacyLines:old.lines.length,legacyPresentation:370,aiLines:ai.lines.length,aiStandards:standards.length,aiAreas:4,examQuestions:q.questions.length,trimmedSegments:trimmed},null,2));
