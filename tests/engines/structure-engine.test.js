'use strict';
process.env.TZ = 'Asia/Seoul';
const assert = require('assert');
global.window = {};
require('../../data/curriculum/2022/curriculum.js');
const S = require('../../js/engines/structure-engine.js');
const data = window.CURRILOOP_CURRICULUM_DATA;

assert.equal(S.extractStandardCode('[9정03-05] 데이터를 순차적으로 저장한다.'), '9정03-05');
assert.deepEqual(S.extractStandardCodes('[12정03-02], [12정03-03] 여러 성취기준을 연결한다.'), ['12정03-02','12정03-03']);
assert.equal(S.stripStandardCode('[9정03-05] 데이터를 순차적으로 저장한다.'), '데이터를 순차적으로 저장한다.');

const order=['middle-info','high-info','ai-basic','data-science','info-science','software-life'];
let pools=0, questions=0, multiCommentary=0;
for (const subjectKey of order) {
  const areas=Object.keys(data[subjectKey]).filter(area=>area!=='과목 공통');
  assert(areas.length>=4, `${subjectKey}: regular areas`);
  assert.equal(S.buildQuestionPool(data,subjectKey,'과목 공통').length,0,`${subjectKey}: common area must not create structure gate`);
  for (const area of areas) {
    const pool=S.buildQuestionPool(data,subjectKey,area);
    pools++; questions+=pool.length;
    assert(pool.length>0,`${subjectKey}/${area}: structure pool`);
    assert(!pool.some(q=>q.kind==='discriminate'||q.kind==='element-connect'),`${subjectKey}/${area}: trivial question removed`);
    const commentary=pool.filter(q=>q.kind==='commentary-connect');
    assert(commentary.length>0,`${subjectKey}/${area}: commentary links`);
    for (const q of commentary) {
      assert(q.choices.length>=2 && q.choices.length<=4,`${subjectKey}/${area}: compact commentary choices`);
      assert(Array.isArray(q.answers)&&q.answers.length>=1,`${subjectKey}/${area}: commentary answers`);
      q.answers.forEach(answer=>assert(q.choices.some(choice=>choice.value===answer),`${subjectKey}/${area}: correct commentary choice`));
      assert(!/^\s*\[[^\]]+\]/.test(q.prompt),`${subjectKey}/${area}: commentary code hidden`);
      if(q.multiSelect){ multiCommentary++; assert(q.answers.length>1,`${subjectKey}/${area}: multi commentary alignment`); }
    }
    if(subjectKey==='middle-info'){
      const links=pool.filter(q=>q.kind==='standard-elements');
      assert(links.length>=1,`${area}: middle standard-content links`);
      assert(!pool.some(q=>q.kind==='process-subject'),`${area}: middle course discrimination unnecessary`);
      links.forEach(q=>{
        assert(q.multiSelect===true,`${area}: standard-content is multi-select`);
        q.answers.forEach(answer=>assert(q.choices.some(choice=>choice.value===answer),`${area}: linked element in choices`));
        assert(!/^\s*\[9정/.test(q.prompt),`${area}: standard code hidden`);
      });
    } else {
      const process=pool.filter(q=>q.kind==='process-subject');
      assert(process.length>=1,`${subjectKey}/${area}: process-course discrimination`);
      for(const q of process){
        assert(q.multiSelect===false,`${subjectKey}/${area}: process subject single answer`);
        assert(q.choices.length===4,`${subjectKey}/${area}: four subject choices`);
        assert(new Set(q.choices.map(x=>x.value)).size===4,`${subjectKey}/${area}: unique subject choices`);
        assert(q.choices.some(x=>x.value===subjectKey),`${subjectKey}/${area}: answer present`);
      }
    }
    const session=S.buildSession(data,subjectKey,area,{limit:6,nonce:7});
    assert(session.length>=3&&session.length<=6,`${subjectKey}/${area}: compact session size ${session.length}`);
    assert.equal(new Set(session.map(q=>q.id)).size,session.length,`${subjectKey}/${area}: no session duplicate`);
    assert(session.some(q=>q.kind==='commentary-connect'),`${subjectKey}/${area}: session commentary`);
    if(subjectKey!=='middle-info'){
      const mixed=session.filter(q=>q.kind==='process-subject');
      assert(mixed.length>=1,`${subjectKey}/${area}: mixed process discrimination present`);
      assert(mixed.some(q=>q.answer!==subjectKey),`${subjectKey}/${area}: current page must not reveal every process answer`);
    }
  }
}
assert.equal(multiCommentary,1,'exactly one multi-standard commentary in current corpus');
const hi=S.buildQuestionPool(data,'high-info','알고리즘과 프로그래밍');
const multi=hi.find(q=>q.kind==='commentary-connect'&&q.multiSelect);
assert(multi && multi.answerCodes.join('|')==='12정03-02|12정03-03','high-info multi-code commentary preserved');
console.log(`structure-engine: OK (pools=${pools}, questions=${questions}, multiCommentary=${multiCommentary})`);
