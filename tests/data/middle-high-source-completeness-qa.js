const assert=require('assert');global.window={};require('../../data/curriculum/2022/curriculum.js');const data=window.CURRILOOP_CURRICULUM_DATA;
function counts(id){const out={};for(const groups of Object.values(data[id]['과목 공통']||{}))for(const sec of groups||[])out[sec.title]=(sec.lines||[]).length;return out;}
const middle=counts('middle-info'),high=counts('high-info');
assert.deepStrictEqual(middle,{'성격':4,'목표':6,'교수·학습의 방향':6,'교수·학습 방법':5,'평가의 방향':4,'평가 방법':3});
assert.deepStrictEqual(high,{'성격':3,'목표':6,'교수·학습의 방향':5,'교수·학습 방법':5,'평가의 방향':4,'평가 방법':5});
function text(id){const out=[];for(const groups of Object.values(data[id]['과목 공통']||{}))for(const sec of groups||[])for(const l of sec.lines||[])out.push(l.text);return out.join('\n');}
const mt=text('middle-info'),ht=text('high-info');
for(const x of ['학생의 디지털 역량 수준을 파악하여','현 시대가 당면한 여러 사회문제','학습 결손이 발생하지 않도록','개인차를 고려한 소집단','단순하고 지엽적인 지식의 평가'])assert(mt.includes(x),`middle repair missing ${x}`);
for(const x of ['학습 소재, 학습 환경 및 학습 과정에 대한 선택의 기회','현 시대가 당면한 여러 사회문제','교육과정을 자율적으로 재구성','의미 있는 학습자 중심의 활동 경험','온오프라인 연계 수업','과정을 중시하는 평가를 통해 학생의 성장과 발달','학습 부진, 느린 학습자가 참여할 수 있고'])assert(ht.includes(x),`high repair missing ${x}`);
let total=0;for(const s of Object.values(data))for(const u of Object.values(s))for(const g of Object.values(u))for(const sec of Array.isArray(g)?g:[])total+=(sec.lines||[]).length;assert.equal(total,674);console.log('middle/high source completeness QA',{total,middle,high});
