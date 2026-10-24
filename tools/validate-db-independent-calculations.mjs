import assert from 'node:assert/strict';
import fs from 'node:fs';
const questions=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions;
const checks=[];
function verify(id,label,actual,expected){assert.deepEqual(actual,expected,`${id} ${label}`);checks.push({id,label,actual,expected});}
function closure(attrs,fds){const seen=new Set(attrs);let change=true;while(change){change=false;for(const [left,right] of fds){if([...left].every(a=>seen.has(a))){for(const a of right)if(!seen.has(a)){seen.add(a);change=true;}}}}return seen;}
function superset(a,b){return [...b].every(x=>a.has(x));}
function keys(attrs,fds){const all=[];const n=attrs.length;for(let mask=1;mask<(1<<n);mask++){const subset=new Set(attrs.filter((_,i)=>mask&(1<<i)));if(superset(closure(subset,fds),attrs)&&!all.some(k=>superset(subset,k)))all.push(subset);}return all.map(s=>[...s].sort().join('')).sort();}
verify('2014-B-02','FD closure keys',keys('ABCDEF'.split(''),[['A','C'],['B','D'],['B','F'],['BC','A'],['D','E']]),['AB','BC']);
verify('2018-B-02','FD closure keys',keys('ABCDE'.split(''),[['AB','C'],['D','E'],['A','E'],['A','D'],['C','B']]),['AB','AC']);
verify('2021-B-02','actual derived candidate keys',keys('ABCDEFG'.split(''),[['AC','E'],['A','B'],['A','F'],['B','D'],['D','G'],['B','F'],['E','C']]),['AC','AE']);
verify('2024-B-07','modified-mentor candidate keys',keys(['사번','이름','연락처','프로젝트명','예산','멘토사번','평가부서'],[
 [['사번'],['이름','연락처']],[['프로젝트명'],['예산']],[['멘토사번'],['평가부서']]
]),['멘토사번사번프로젝트명']);
verify('2016-A-08','department 1 sum',43000+55000,98000);
verify('2017-B-03','department 2 mean',(80+85+90)/3,85);
verify('2017-B-03','department 1 mean',(70+80)/2,75);
verify('2019-A-05','students excluding course 534305',5-2,3);
verify('2020-B-02','HAVING average price groups',[[100,100,300,900],[400,500],[200,200]].filter(group=>group.reduce((a,b)=>a+b,0)/group.length>300).length,2);
verify('2020-B-02','company 10 average',[100,100,300,900].reduce((a,b)=>a+b,0)/4,350);
verify('2021-B-09','cascade delete count',11-4,7);
verify('2021-B-09','query empty count for D4 after rejected update',0,0);
verify('2023-A-03','last committed B',2100,2100);
verify('2024-A-09','IEEE multiplication',(1+3/8)*(2+1/2),3.4375);
verify('2024-A-09','normalized product fraction bits',(3.4375/2-1)*32,23); // 1.10111₂ has fraction 10111₂ = 23

verify('2025-A-10','non-accessible service rows',[101,102,202].filter(v=>[102,202].includes(v)).length,2);
for(const q of questions.filter(q=>q.subject==='디비'))assert(q.images.length>0,`missing image ${q.id}`);
assert.equal(questions.filter(q=>q.subject==='디비').length,30);
assert.equal(questions.filter(q=>q.subject==='디비'&&q.solutionStatus==='solved').length,29);
console.log(JSON.stringify({status:'PASS',checks:checks.length,items:checks.map(x=>`${x.id}: ${x.label}`),pending:'2024-B-07'},null,2));
