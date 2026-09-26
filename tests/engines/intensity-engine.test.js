'use strict';
process.env.TZ='Asia/Seoul';
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'data/curriculum/2022/curriculum.js'),'utf8'),ctx);
const data=ctx.window.CURRILOOP_CURRICULUM_DATA;
const R=require('../../js/engines/recall-engine.js');
const I=require('../../js/engines/intensity-engine.js');
const C=require('../../data/learning-aids/gap-intensity.js');
const order=['middle-info','high-info','ai-basic','data-science','info-science','software-life'];
const before=JSON.stringify(data);
const focus={
  '가치·태도':{lines:0,raw:0,selected:0,cov:0,max:0,limit:.26},
  '성취기준 해설':{lines:0,raw:0,selected:0,cov:0,max:0,limit:.13},
  '성취기준 적용 시 고려 사항':{lines:0,raw:0,selected:0,cov:0,max:0,limit:.14}
};
let exactLines=0,nonExactLines=0;
function raw(line,difficulty='easy'){return (line[difficulty]||[]).map((answer,i)=>({answer,gapId:line.gapIds?.[difficulty]?.[i]||`${difficulty}-g${i}`})).filter(x=>x.answer&&line.text.includes(x.answer));}
function candidates(line,tier){
  const easy=raw(line,'easy');
  if(tier==='exact') return easy;
  const override=C.lineOverrides?.[line.id];
  if(!Array.isArray(override)||!override.length) return easy;
  const seen=new Set(easy.map(x=>x.answer));
  return easy.concat(raw(line,'normal').filter(x=>{if(seen.has(x.answer)) return false; seen.add(x.answer); return true;}));
}
for(const sk of order){
  assert(data[sk],`${sk}: subject`);
  for(const unit of Object.values(data[sk])) for(const [groupName,sections] of Object.entries(unit)) if(Array.isArray(sections)) for(const section of sections){
    const tier=R.memoryTier(section.title,groupName).key;
    for(const line of section.lines||[]){
      const source=candidates(line,tier); if(!source.length) continue;
      const selected=I.selectCoreEntries(line,source,section.title,groupName,tier);
      assert(selected.length>0,`${line.id}: selected core target`);
      assert(selected.every(x=>source.some(y=>y.gapId===x.gapId&&y.answer===x.answer)),`${line.id}: metadata must only select existing gaps`);
      if(tier==='exact'){exactLines++;assert.equal(selected.length,source.length,`${line.id}: exact tier unchanged`);}
      else {
        nonExactLines++;
        const override=C.lineOverrides?.[line.id];
        if(Array.isArray(override)&&override.length){
          assert.deepStrictEqual(selected.map(x=>x.answer),source.filter(x=>override.includes(x.answer)).map(x=>x.answer),`${line.id}: semantic override`);
        } else {
          const profile=I.profileFor(section.title,groupName,tier);
          assert(selected.length<=Math.min(source.length,profile.maxCore),`${line.id}: max core`);
        }
      }
      if(focus[section.title]){const s=focus[section.title];s.lines++;s.raw+=source.length;s.selected+=selected.length;const cov=I.hiddenCoverage(line.text,selected);s.cov+=cov;s.max=Math.max(s.max,cov);}
    }
  }
}
assert.equal(JSON.stringify(data),before,'intensity selection must not mutate official curriculum data');
for(const [title,s] of Object.entries(focus)){
  s.avg=Number((s.cov/s.lines).toFixed(3));s.max=Number(s.max.toFixed(3));delete s.cov;
  assert(s.avg<=s.limit,`${title}: average hidden coverage ${s.avg} > ${s.limit}`);
}
assert.equal(C.profiles['value-attitude'].practical,'free-keyword');
assert.equal(C.profiles['achievement-commentary'].practical,'free-keyword');
assert.equal(C.profiles['achievement-consideration'].practical,'free-keyword');
console.log(JSON.stringify({intensity:'OK',exactLines,nonExactLines,focus},null,2));
