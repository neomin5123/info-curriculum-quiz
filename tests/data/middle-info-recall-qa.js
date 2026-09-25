'use strict';
process.env.TZ = 'Asia/Seoul';
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const assert=require('assert');
const root=path.resolve(__dirname,'../..');
const ctx={window:{}}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'data/curriculum/2022/curriculum.js'),'utf8'),ctx);
const R=require('../../js/engines/recall-engine.js');
const middle=ctx.window.CURRILOOP_CURRICULUM_DATA['middle-info'];
assert(middle,'middle-info missing');
const areas=Object.keys(middle).filter(a=>a!=='과목 공통');
assert.equal(areas.length,5);
let exactSections=0, exactLines=0, standards=0;
for(const area of areas){
  const groups=middle[area];
  for(const section of groups['content-system']||[]){
    const tier=R.memoryTier(section.title,'content-system').key;
    if(['지식·이해','과정·기능'].includes(section.title)){
      assert.equal(tier,'exact',`${area}/${section.title}`);
      assert.equal(R.holisticKind(section.title),'list');
      assert(section.lines.length>=2);
      exactSections++; exactLines+=section.lines.length;
    }
  }
  const standard=(groups.achievement||[]).find(s=>s.title==='성취기준');
  assert(standard,`${area} standards missing`);
  assert.equal(R.memoryTier(standard.title,'achievement').key,'exact');
  assert.equal(R.holisticKind(standard.title),'achievement');
  for(const line of standard.lines){
    const split=R.splitAchievement(line.text);
    assert(split.code && split.body,`${area}: malformed achievement ${line.text}`);
  }
  standards+=standard.lines.length; exactSections++; exactLines+=standard.lines.length;
}
assert.equal(exactSections,15,'5 areas × (knowledge/process/standards)');
assert.equal(standards,25,'middle-info achievement standard count');
console.log(JSON.stringify({areas:areas.length,exactSections,exactLines,standards},null,2));
