'use strict';
const assert = require('assert');
const Practice = require('../js/practice-engine.js');
const Grading = require('../js/grading-engine.js');

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
