'use strict';
process.env.TZ = 'Asia/Seoul';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'../..');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'data/curriculum/2022/curriculum.js'),'utf8'),ctx);
const data=ctx.window.CURRILOOP_CURRICULUM_DATA;
const R=require('../../js/engines/recall-engine.js');
const S=require('../../js/engines/structure-engine.js');
const P=require('../../js/engines/planner-engine.js');
const order=['middle-info','high-info','ai-basic','data-science','info-science','software-life'];
const expectedAreas={'middle-info':5,'high-info':5,'ai-basic':4,'data-science':4,'info-science':4,'software-life':5};
const requiredContent=['핵심 아이디어','지식·이해','과정·기능','가치·태도'];
const requiredAchievement=['성취기준','성취기준 해설','성취기준 적용 시 고려 사항'];
let lines=0,gaps=0,regularAreas=0,exactSections=0,exactLines=0,standards=0,commentaries=0;
const ids=new Set(), codes=new Map();
const report={};
for(const sk of order){
  assert(data[sk],`${sk}: subject exists`);
  const common=data[sk]['과목 공통']; assert(common,`${sk}: common area`);
  const regular=Object.entries(data[sk]).filter(([a])=>a!=='과목 공통');
  assert.equal(regular.length,expectedAreas[sk],`${sk}: regular area count`); regularAreas+=regular.length;
  let subjectLines=0,subjectStandards=0,subjectExact=0,subjectQuestions=0;
  for(const [area,unit] of Object.entries(data[sk])){
    for(const group of Object.values(unit)) if(Array.isArray(group)) for(const section of group){
      for(const line of section.lines||[]){
        lines++;subjectLines++; assert(line.id,`${sk}/${area}/${section.title}: id`); assert(!ids.has(line.id),`duplicate line id ${line.id}`);ids.add(line.id);
        for(const level of ['easy','normal']){ const arr=line[level]||[], gids=line.gapIds?.[level]||[]; gaps+=arr.length; assert.equal(gids.length,arr.length,`${line.id}/${level}: gap ids`); arr.forEach(x=>assert(line.text.includes(x),`${line.id}/${level}: gap outside source`)); }
      }
    }
    if(area==='과목 공통'){
      assert.equal(S.hasQuestions(data,sk,area),false,`${sk}: common area no structure gate`);
      continue;
    }
    const content=unit['content-system']||[], achievement=unit.achievement||[];
    requiredContent.forEach(title=>assert(content.some(s=>s.title===title),`${sk}/${area}: content section ${title}`));
    requiredAchievement.forEach(title=>assert(achievement.some(s=>s.title===title),`${sk}/${area}: achievement section ${title}`));
    for(const title of ['지식·이해','과정·기능','성취기준']){
      const sec=(title==='성취기준'?achievement:content).find(s=>s.title===title); assert(sec?.lines?.length,`${sk}/${area}: exact ${title}`);
      exactSections++;subjectExact++;exactLines+=sec.lines.length;
      assert.equal(R.memoryTier(title,title==='성취기준'?'achievement':'content-system').key,'exact',`${sk}/${area}/${title}: exact tier`);
      assert(R.holisticKind(title),`${sk}/${area}/${title}: holistic kind`);
    }
    const std=achievement.find(s=>s.title==='성취기준').lines; standards+=std.length;subjectStandards+=std.length;
    for(const line of std){ const cs=S.extractStandardCodes(line.text); assert(cs.length>=1,`${line.id}: standard code`); for(const c of cs){ const key=`${sk}|${c}`;assert(!codes.has(key),`${sk}: duplicate standard code ${c}`);codes.set(key,line.id);} }
    const comm=achievement.find(s=>s.title==='성취기준 해설').lines; commentaries+=comm.length;
    for(const line of comm){ const cs=S.extractStandardCodes(line.text); assert(cs.length>=1,`${line.id}: commentary code`); cs.forEach(c=>assert(codes.has(`${sk}|${c}`),`${line.id}: missing linked standard ${c}`)); }
    const pool=S.buildQuestionPool(data,sk,area); assert(pool.length>0,`${sk}/${area}: structure pool`); subjectQuestions+=pool.length;
    const session=S.buildSession(data,sk,area,{limit:6,nonce:3}); assert(session.length>0,`${sk}/${area}: structure session`);
    for(const q of pool){
      assert(q.prompt && (q.answer || (Array.isArray(q.answers)&&q.answers.length)),`${q.id}: prompt/answer`); assert(q.choices?.length>=2,`${q.id}: choices`);
      const vals=q.choices.map(x=>x.value); assert.equal(new Set(vals).size,vals.length,`${q.id}: duplicate choices`);
      const answers=q.multiSelect?q.answers:[q.answer]; answers.forEach(a=>assert(vals.includes(a),`${q.id}: answer in choices`));
    }
  }
  report[sk]={areas:regular.length,lines:subjectLines,standards:subjectStandards,exactSections:subjectExact,structureQuestions:subjectQuestions};
}
assert.equal(lines,674,'official line count'); assert.equal(gaps,6327,'official gap count'); assert.equal(regularAreas,27,'regular area count');
assert.equal(standards,123,'achievement standard line count'); assert.equal(exactSections,27*3,'three exact sections per regular area');
const expectedStandards={'middle-info':25,'high-info':23,'ai-basic':19,'data-science':19,'info-science':18,'software-life':19};
for(const sk of order) assert.equal(report[sk].standards,expectedStandards[sk],`${sk}: official achievement-standard count`);
const planner=P.buildStudySections(data,order,'과목 공통'); assert.equal(planner.length,225,'planner section count');
assert.equal(new Set(planner.map(x=>x.id)).size,planner.length,'planner unique IDs');
assert(planner.every(x=>x.workloadScore>0),'planner workload positive');
// v7.8 source audit regressions: these five lines were corrected directly against the official HWP corpus.
function lineById(id){
  for(const sub of Object.values(data)) for(const unit of Object.values(sub)) for(const group of Object.values(unit)) if(Array.isArray(group)) for(const section of group) for(const line of section.lines||[]) if(line.id===id) return line;
  return null;
}
const miChar=lineById('MI-CG-CHAR-01'); assert(miChar?.text.startsWith('‘정보(Informatics)’과는'), 'MI Informatics source correction');
const isChar=lineById('IS-CG-CHAR-01'); assert(isChar?.text.includes('소프트웨어 공학에 대한'), 'IS source correction'); assert(isChar.easy.includes('소프트웨어 공학') && isChar.normal.includes('소프트웨어 공학'), 'IS gap correction');
const hiGoal=lineById('HI-CG-GOAL-00'); assert(hiGoal?.text.startsWith('고등학교 ‘정보’는 인공지능과 더불어 살아가게 될 미래 사회에서 독립적으로 살아가는 데 필요한 정보 관련 능력을 함양하여'), 'HI goal source correction'); assert(hiGoal.easy.includes('정보 관련 능력') && hiGoal.normal.includes('정보처리'), 'HI goal gap correction');
const hiEval=lineById('HI-TE-EVM-02'); assert(hiEval?.text.includes('프로그램 자동 평가시스템(online judge 등), 학습관리시스템(LMS) 등'), 'HI evaluation source correction'); assert(hiEval.easy.includes('online judge') && hiEval.easy.includes('학습관리시스템'), 'HI evaluation gap correction');
const aiEthics=lineById('AI-03-AC-EX-02'); assert(aiEthics?.text.includes('인공지능 윤리(지침)와 관련하여'), 'AI commentary particle correction'); assert((aiEthics.yaho||[]).some(x=>x.includes('인공지능 윤리(지침)와 관련하여')), 'AI yaho correction');
console.log(JSON.stringify({subjects:order.length,regularAreas,lines,gaps,standards,commentaries,exactSections,exactLines,plannerSections:planner.length,workload:Math.round(planner.reduce((s,x)=>s+x.workloadScore,0)*10)/10,report},null,2));
