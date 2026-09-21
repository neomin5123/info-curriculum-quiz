'use strict';
const assert = require('assert');
const Practice = require('../../js/practice/practice-engine.js');
const Grading = require('../../js/engines/grading-engine.js');

let unit = {key:'구상한다',acceptedVariants:[],forbiddenConfusions:['설계한다','구현한다']};
assert.equal(Practice.gradeAnswer('구상한다',unit,2,Grading).status,'correct');
assert.equal(Practice.gradeAnswer('설계한다',unit,2,Grading).status,'wrong');
assert.equal(Practice.gradeAnswer('',unit,2,Grading).status,'unknown');

unit = {key:'정의하기, 구조화하기',acceptedVariants:['정의하고 구조화하기'],forbiddenConfusions:['문제 추상화'],requiredConcepts:['정의','구조화']};
assert.equal(Practice.gradeAnswer('상태를 정의하고 수행 가능한 형태로 구조화하기',unit,2,Grading).status,'correct');
assert.equal(Practice.gradeAnswer('정의하기만 한다',unit,2,Grading).status,'near');
assert.equal(Practice.gradeAnswer('정의와 구조화는 정답이 아니며 수행하지 않는다',unit,2,Grading).status,'near');
assert.notEqual(Practice.gradeAnswer('문제 추상화가 아니라 정의와 구조화도 하지 않는다',unit,2,Grading).status,'correct');

unit = {key:'둘 고르기',acceptedVariants:[],forbiddenConfusions:[],anyOf:{pool:['협업','발표','토론','의사소통','협력적 태도'],count:2,distinct:true}};
assert.equal(Practice.gradeAnswer('협업과 토론',unit,2,Grading).status,'correct');
assert.equal(Practice.gradeAnswer('협업만',unit,2,Grading).status,'near');
assert.equal(Practice.gradeAnswer('협업과 토론을 하지 않는다',unit,2,Grading).status,'near');


unit = {key:'디버거',acceptedVariants:[],forbiddenConfusions:['컴파일러']};
assert.equal(Practice.gradeAnswer('컴파일러',unit,2,Grading).status,'wrong');
assert.equal(Practice.gradeAnswer('컴파일러가 아니라 디버거',unit,2,Grading).status,'correct');
assert.notEqual(Practice.gradeAnswer('컴파일러가 아니라 디버거도 아니다',unit,2,Grading).status,'correct');

const q={tasks:[{id:'a',points:1},{id:'b',points:1}],answerUnits:[{taskId:'a',key:'함수',acceptedVariants:[],forbiddenConfusions:[]},{taskId:'b',key:'디버거',acceptedVariants:[],forbiddenConfusions:['컴파일러']}]};
const grade=Practice.gradeQuestion(q,{a:'함수',b:'디버거'},Grading);
assert.equal(grade.earned,2); assert.equal(grade.total,2); assert.equal(grade.perfect,true);

const list=[
  {questionId:'1',subjects:['a','b'],areas:['x'],comparison2015:false},
  {questionId:'2',subjects:['b'],areas:['y','z'],comparison2015:true}
];
assert.deepEqual(Practice.filterQuestions(list,{subject:'a',area:'all',version:'all'}).map(x=>x.questionId),['1']);
assert.deepEqual(Practice.filterQuestions(list,{subject:'b',area:'z',version:'all'}).map(x=>x.questionId),['2']);
assert.deepEqual(Practice.filterQuestions(list,{subject:'all',area:'all',version:'comparison'}).map(x=>x.questionId),['2']);
console.log('practice-engine tests: OK');

function seededRandom(seed) {
  let x = seed >>> 0;
  return () => { x = (1664525 * x + 1013904223) >>> 0; return x / 4294967296; };
}
const examPool = [
  {questionId:'s1',curriculumScopes:[{subject:'a',area:'x'}],sourceIds:['A'],comparison2015:false},
  {questionId:'s2',curriculumScopes:[{subject:'b',area:'y'}],sourceIds:['B'],comparison2015:false},
  {questionId:'s3',curriculumScopes:[{subject:'c',area:'z'}],sourceIds:['C'],comparison2015:false},
  {questionId:'s4',curriculumScopes:[{subject:'d',area:'w'}],sourceIds:['D'],comparison2015:false},
  {questionId:'s5',curriculumScopes:[{subject:'e',area:'v'}],sourceIds:['E'],comparison2015:false},
  {questionId:'s6',curriculumScopes:[{subject:'a',area:'x'}],sourceIds:['A'],comparison2015:true},
  {questionId:'s7',curriculumScopes:[{subject:'b',area:'y'}],sourceIds:['B'],comparison2015:true}
];
const examSet = Practice.buildExamSet(examPool,{size:5,randomFn:seededRandom(7)});
assert.equal(examSet.length,5);
assert.equal(new Set(examSet).size,5);
const selectedSet = examSet.map(id => examPool.find(q => q.questionId === id));
assert.equal(new Set(selectedSet.flatMap(q => q.sourceIds)).size,5,'set generator should avoid repeated sourceIds when alternatives exist');
assert.ok(new Set(selectedSet.flatMap(q => q.curriculumScopes.map(s => s.subject))).size >= 4,'set generator should diversify subjects');
assert.ok(selectedSet.filter(q => q.comparison2015).length <= 1,'set generator should avoid clustering comparison items');

const adaptiveQuestion={questionId:'a1',curriculumScopes:[{subject:'middle-info',area:'데이터'}],sourceType:['성취기준','평가 방법','과정·기능']};
let adaptive=Practice.updateAdaptiveState({},adaptiveQuestion,'wrong',1000);
assert.ok(adaptive.scopes['middle-info::데이터'].deficit>0,'wrong answer should raise scope deficit');
assert.ok(adaptive.sourceTypes['평가 방법'].deficit>0,'wrong answer should raise official source-layer deficit');
assert.ok(adaptive.sourceTypes['과정·기능'].deficit>0,'content-system source layer should be tracked');
assert.equal(adaptive.sourceTypes['성취기준'],undefined,'ubiquitous achievement-standard layer should not dominate adaptive ranking');
const adaptivePriority=Practice.adaptiveDimensionPriority(adaptive,adaptiveQuestion);
assert.ok(adaptivePriority>0,'adaptive deficit should raise question priority');
for(let i=0;i<4;i++) adaptive=Practice.updateAdaptiveState(adaptive,adaptiveQuestion,'correct',1100+i);
assert.ok(Practice.adaptiveDimensionPriority(adaptive,adaptiveQuestion)<adaptivePriority,'repeated correct answers should reduce adaptive priority');
