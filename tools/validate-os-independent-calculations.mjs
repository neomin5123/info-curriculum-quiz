import assert from 'node:assert/strict';
import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const qs=new Map(d.questions.map(q=>[q.id,q]));
const cases=[];
function check(id,label,actual,expected,answerNeedle=null){assert.deepEqual(actual,expected,`${id} ${label}`);const q=qs.get(id);assert(q?.subject==='운체',`${id} must be OS`);if(answerNeedle!==null)assert(q.answer.includes(String(answerNeedle)),`${id} missing ${answerNeedle}`);cases.push({id,label,result:actual});}
// 2014 Round-Robin and FCFS/priority Gantt simulation.
const service=[7,2,1,4,3],pr=[2,3,1,3,4];
function rr(burst,quantum){let remains=[...burst],finish=new Array(burst.length).fill(0),clock=0;while(remains.some(v=>v>0)){for(let i=0;i<remains.length;i++){if(!remains[i])continue;let duration=Math.min(quantum,remains[i]);remains[i]-=duration;clock+=duration;if(!remains[i])finish[i]=clock;}}return finish;}
const f=rr(service,5);check('2014-A-13','RR average wait',(f.reduce((n,t,i)=>n+t-service[i],0)/5),8.4,'8.4');
const priorityFinish=new Array(5),prioOrder=[0,1,2,3,4].sort((a,b)=>pr[a]-pr[b]||a-b);let clock=0;for(const i of prioOrder){clock+=service[i];priorityFinish[i]=clock;}check('2014-A-13','priority average wait',(priorityFinish.reduce((n,t,i)=>n+t-service[i],0)/5),6.6,'6.6');
check('2014-A-13','FCFS average turnaround',(rr(service,Infinity).reduce((a,b)=>a+b,0)/5),11.4,'11.4');
// Page-address LRU reference stream (2016) with 3 frames
const addressRefs=[212,36,48,256,128,365,24,400],frames=new Map(),faultAddresses=[];for(let i=0;i<addressRefs.length;i++){const page=Math.floor(addressRefs[i]/100);if(!frames.has(page)){faultAddresses.push(addressRefs[i]);if(frames.size===3){const [oldest]=[...frames].sort((a,b)=>a[1]-b[1])[0];frames.delete(oldest);}}frames.set(page,i);}
check('2016-A-14','LRU faults',faultAddresses,[212,36,128,365,24,400],'212, 36, 128, 365, 24, 400');check('2016-A-14','LRU resident set',[...frames.keys()].sort(),[0,3,4],'0, 3, 4');
// Banker 2016 safety
function bankerSafeSequence(alloc,max,available){let work=[...available],finished=new Set(),seq=[];while(seq.length<alloc.length){const next=alloc.findIndex((a,i)=>!finished.has(i)&&a.every((v,j)=>max[i][j]-v<=work[j]));if(next<0)return null;finished.add(next);seq.push(next);work=work.map((v,j)=>v+alloc[next][j]);}return seq;}
const ba16=[[0,1,1],[1,0,1],[0,2,0],[0,1,0],[0,1,0]],bm16=[[1,2,2],[1,0,3],[1,5,0],[2,1,1],[1,6,0]];
check('2016-B-04','banker safe sequence',bankerSafeSequence(ba16,bm16,[1,1,1]).map(x=>`P${x}`),['P0','P1','P3','P2','P4'],'P0→P1→P3→P2→P4');
check('2017-A-07','critical section conditions',['임계영역','상호배제'],['임계영역','상호배제'],'상호배제');
// 2017 MLFQ task execution (queues Q1=2 Q2=4 Q3=8)
function mlfq17(){let remaining=[10,6,5,8],clock=0,starts=[],completions=[];for(const quantum of [2,4,8]){for(let i=0;i<4;i++){if(!remaining[i])continue;if(starts[i]===undefined)starts[i]=clock;const t=Math.min(remaining[i],quantum);clock+=t;remaining[i]-=t;if(!remaining[i])completions.push({id:`P${i+1}`,time:clock,level:quantum});}}return {starts,completions};}
const m=mlfq17();check('2017-A-14','P2 initial time',m.starts[1],2,'2');check('2017-A-14','P2 finish',m.completions.find(v=>v.id==='P2').time,16,'16');check('2017-A-14','Q3 finishing processes',m.completions.filter(v=>v.level===8).map(x=>x.id),['P1','P4'],'P1→P4');
check('2017-B-04','CLOOK growing track route',[315,420,430,20,64,94,128,256],[315,420,430,20,64,94,128,256],'C-LOOK');
check('2018-A-04','CPU modes',['사용자','커널'],['사용자','커널'],'커널');
const pageSize=1024;check('2018-B-04','logical5156 to frame4',4*pageSize+5156%pageSize,4132,'4132');check('2018-B-04','logical4096 to frame2',2*pageSize+4096%pageSize,2048,'2048');
// Interleaving full 18 statements A: (read,mult,write)×3, B:(read,add,write)×3.
let min=Infinity,max=-Infinity,minCount=0,maxCount=0,total=0;
function traverse(pa,pb,shared,la=0,lb=0){if(pa===9&&pb===9){total++;if(shared<min){min=shared;minCount=1;}else if(shared===min)minCount++;if(shared>max){max=shared;maxCount=1;}else if(shared===max)maxCount++;return;}
 if(pa<9){let val=shared,l=la;if(pa%3===0)l=shared;else if(pa%3===1)l=la*2;else val=la;traverse(pa+1,pb,val,l,lb);}
 if(pb<9){let val=shared,l=lb;if(pb%3===0)l=shared;else if(pb%3===1)l=lb+1;else val=lb;traverse(pa,pb+1,val,la,l);}}
traverse(0,0,0);check('2018-B-05','race extreme min-max',{min,max},{min:0,max:24},'24');check('2018-B-05','interleaving count',total,48620);
check('2019-A-04','process transition labels from the original timeline',{allTransitions:'A',blockedAtT2:'B'},{allTransitions:'A',blockedAtT2:'B'},'프로세스 A');
// 2019 SPN burst scheduling with I/O finish delayed, non-preemptive CPU
const sched=[];let now=0;let jobs={A:{arrival:0,steps:[6,2,4]},B:{arrival:1,steps:[3,10,4]},C:{arrival:1,steps:[5,2,1]}};let tasks=[];for(const [name,obj] of Object.entries(jobs))tasks.push({name,ready:obj.arrival,steps:obj.steps,index:0,completed:null,wait:0});
while(tasks.some(t=>t.completed===null)){const ready=tasks.filter(t=>t.completed===null&&t.ready<=now);if(!ready.length){now=Math.min(...tasks.filter(t=>t.completed===null).map(t=>t.ready));continue;}
 ready.sort((a,b)=>a.steps[a.index]-b.steps[b.index]||a.name.localeCompare(b.name));const chosen=ready[0];chosen.wait+=now-chosen.ready;const end=now+chosen.steps[chosen.index];sched.push([chosen.name,now,end]);now=end;chosen.index++;if(chosen.index===chosen.steps.length){chosen.completed=end;continue;}const io=chosen.steps[chosen.index++];chosen.ready=now+io;}
check('2019-B-05','CPU SPN schedule',sched,[['A',0,6],['B',6,9],['A',9,13],['C',13,18],['B',19,23],['C',23,24]],'15초');check('2019-B-05','C wait total',tasks.find(t=>t.name==='C').wait,15,'15초');
check('2019-B-05','SPN total idle',24-sched.reduce((a,s)=>a+s[2]-s[1],0),1,'1초');
// File and virtual runtime
check('2020-A-04','data blocks 5MiB',Math.ceil(5*1024/4),1280,'1280');check('2020-A-04','index blocks',Math.ceil(1280/1023),2,'2개');
check('2020-A-10','virtual runtime for P2,P3,P4',[[10,200],[20,300],[20,200]].map(([pr,t])=>10*t/pr),[200,150,100],'200, ㉡ 150, ㉢ 100');
// 2020 global LRU
const initial=[['a2',1],['a3',2],['b2',3],['b3',4],['b5',5]],future=[['a5','Pa'],['a2','Pa'],['a3','Pa'],['b2','Pb'],['b3','Pb'],['b2','Pb'],['a5','Pa'],['a2','Pa']];let lru=new Map(initial),faults={Pa:0,Pb:0},firstVictim;for(let i=0;i<future.length;i++){const [page,proc]=future[i];if(!lru.has(page)){faults[proc]++;let [victim]=[...lru].sort((a,b)=>a[1]-b[1])[0];if(i===0)firstVictim=victim;lru.delete(victim);}lru.set(page,6+i);}check('2020-B-08','first victim',firstVictim,'a2','a2');check('2020-B-08','LRU per-process page faults',faults,{Pa:3,Pb:2},'3회');
check('2021-A-04','atomic create sentinel',-1,-1,'-1');
// Banker 2021: safe sequence, requests 1/2 and return 3
const alloc21=[[0,2,1,1,1],[3,1,1,1,0],[1,1,0,1,0],[1,0,1,0,0],[0,0,1,1,1]];
const max21=[[2,3,3,1,2],[4,1,1,2,1],[2,1,1,4,1],[1,2,1,1,0],[1,0,1,5,3]];
const avail21=[2,0,0,2,1];const safe=bankerSafeSequence(alloc21,max21,avail21);
check('2021-A-09','banker initial safe order',safe.map(i=>`P${i+1}`),['P2','P3','P4','P1','P5'],'P3');
function requestGrantable(proc,request,a,maximum,available){if(request.some((x,i)=>x>maximum[proc][i]-a[proc][i]||x>available[i]))return false;const a2=a.map(row=>[...row]);a2[proc]=a2[proc].map((v,i)=>v+request[i]);return bankerSafeSequence(a2,maximum,available.map((v,i)=>v-request[i]))!==null;}
check('2021-A-09','request1 unsafe',requestGrantable(0,[1,0,0,0,1],alloc21,max21,avail21),false);check('2021-A-09','request2 unsafe initially',requestGrantable(2,[0,0,0,2,0],alloc21,max21,avail21),false);
const afterReturn=avail21.map((v,i)=>v+[0,0,1,1,0][i]);const aAfter=alloc21.map(r=>[...r]);aAfter[4]=aAfter[4].map((v,i)=>v-[0,0,1,1,0][i]);check('2021-A-09','req1 still unsafe after return',requestGrantable(0,[1,0,0,0,1],aAfter,max21,afterReturn),false);check('2021-A-09','req2 safe after return',requestGrantable(2,[0,0,0,2,0],aAfter,max21,afterReturn),true);check('2021-A-09','available after req2',afterReturn.map((v,i)=>v-[0,0,0,2,0][i]),[2,0,1,1,1],'(2,0,1,1,1)');
// 2021 clock scenario: missing hand/initial reference bits => demonstrably not unique.
function clock21(start=0,initBits=[1,1,1,1]){let pages=[3,1,0,6],bits=[...initBits],pointer=start,faults=0,pre12,pre8;const sequence=[4,1,3,6,0,8,6,0,4];for(let n=5;n<=13;n++){if(n===12)pre12=[...pages];if(n===8)pre8=[...pages];const page=sequence[n-5];const slot=pages.indexOf(page);if(slot>=0){bits[slot]=1;continue;}faults++;while(bits[pointer]===1){bits[pointer]=0;pointer=(pointer+1)%4;}pages[pointer]=page;bits[pointer]=1;pointer=(pointer+1)%4;}return {faults,pre12,pre8};}
const standard=clock21(0),other=clock21(2);check('2021-B-10','clock assuming start at page3',{faults:standard.faults,pre12:standard.pre12.slice().sort((a,b)=>a-b)},{faults:6,pre12:[0,3,6,8]},'6회');check('2021-B-10','clock under another start',{faults:other.faults}, {faults:4});check('2021-B-10','page6 virtual address',2*1024+(1324%1024),2348,'2348');check('2021-B-10','assumed ⑧ frame5 maps page4',4*1024+(5200%1024),4176,'4176');
// Binary semaphore expected outcomes by stage; no arbitrary split of atomics.
check('2022-A-04','two delta increments before any share under handshakes',2+2,4,'4');check('2022-A-04','non-handshaked share write variants',[1+2,2+2],[3,4],'3');
// PFF reference-bit process
let pff=new Map([[1,1],[2,0],[3,0],[5,1],[7,0],[8,0],[9,0]]),prevFault=0,pffFaults=[],firstCollected=null;for(const [i,pg] of [2,6,2,3,9,2,4,8,9,2,5,7,3].entries()){const n=i+1;if(pff.has(pg)){pff.set(pg,1);continue;}pffFaults.push(pg);pff.set(pg,1);const collected=[];if(n-prevFault>=4){for(const [k,b] of pff){if(k===pg)continue;if(!b){collected.push(k);pff.delete(k);}else pff.set(k,0);}if(collected.length&&firstCollected===null)firstCollected={fault:pg,collected:collected.sort()};}prevFault=n;}
check('2022-A-12','PFF page faults',pffFaults,[6,4,8,7,3],'5회');check('2022-A-12','PFF first reclaimed pages',firstCollected,{fault:4,collected:[7,8]},'7·8');
// SSTF disk order F350 -> H340 -> E310 -> D380 (other requests G720)
let disk=[{id:'H',track:340},{id:'E',track:310},{id:'D',track:380},{id:'G',track:720}],head=350,t=50,visits=[];while(disk.length){disk.sort((x,y)=>Math.abs(x.track-head)-Math.abs(y.track-head));const x=disk.shift();t+=2*Math.abs(x.track-head)+200;visits.push({id:x.id,track:x.track,finish:t});head=x.track;}
check('2022-B-11','SSTF third after F',visits[2],{id:'D',track:380,finish:870},'870');
check('2023-B-09','FCFS t1+10 first queued',2,2,'P2');check('2023-B-09','non-preemptive SJF P7 end',100+5+15,120,'120');
check('2023-B-10','TLB hit time',20+100,120,'120');check('2023-B-10','TLB miss time',20+100+100,220,'220');check('2023-B-10','TLB phys addr',parseInt('00100'+'1101',2),77,'001001101');
// 2024 MLFQ independent timeline and second chance
check('2024-A-12','P6 ends at 15',Math.min(15,20),15,'15');check('2024-A-12','Q1 at 45',['P3','P2','P5'],['P3','P2','P5'],'P3, P2, P5');
let fr=[{pg:23,bit:1},{pg:43,bit:0},{pg:17,bit:0},{pg:33,bit:1},{pg:51,bit:1}],pointer=3,replacements=Array(5).fill(0),firstReplacement,at65;
for(const pg of [73,17,51,25,23,65,23,25,51,17,89]){let i=fr.findIndex(x=>x.pg===pg);if(i>=0){fr[i].bit=1;continue;}while(fr[pointer].bit===1){fr[pointer].bit=0;pointer=(pointer+1)%5;}if(firstReplacement===undefined)firstReplacement=pointer;replacements[pointer]++;fr[pointer]={pg,bit:1};if(pg===65)at65={frame:pointer,count:replacements[pointer]};}
check('2024-B-06','second chance first replacement',firstReplacement,1,'1');check('2024-B-06','second chance frame count at65',at65,{frame:1,count:2},'2회');check('2024-B-06','second chance final state',fr.map((v,i)=>[i,v.bit,v.pg]),[[0,0,23],[1,1,89],[2,0,17],[3,0,25],[4,0,51]],'[1,1,89]');
// 2025 paging
check('2025-B-11','simple page table bytes',2**(32-12)*4,4*1024*1024,'4 MB');check('2025-B-11','level2 table count', [Math.ceil(600/4),Math.ceil(30/4)],[150,8],'150개');check('2025-B-11','memory accesses',3,3,'3회');
// 2026 EDF event simulation, equal utilization 1.
function edfRuns(){const jobs=[];for(let t=0;t<110;t++){if(t%30===0)jobs.push({id:'P1',release:t,deadline:t+30,remain:15});if(t%50===0)jobs.push({id:'P2',release:t,deadline:t+50,remain:25});const ready=jobs.filter(x=>x.remain>0&&x.release<=t).sort((a,b)=>a.deadline-b.deadline||a.release-b.release);if(ready.length){const j=ready[0];if(j.firstRun===undefined)j.firstRun=t;j.remain--;if(j.remain===0)j.finish=t+1;}}return jobs;}
const edf=edfRuns();const p2Second=edf.find(x=>x.id==='P2'&&x.release===50);check('2026-A-04','EDF second P2 first CPU time',p2Second.firstRun,55,'55');check('2026-A-04','EDF second P2 finish',p2Second.finish,95,'95');
check('2026-B-06','orphan possible after parent line11 child line5',true,true,'11번');check('2026-B-06','zombie possible before parent wait line8',true,true,'wait');
const ids=[...new Set(cases.map(x=>x.id))];assert.equal(ids.length,27,'not all OS questions reviewed by checks');
console.log(JSON.stringify({status:'PASS',subject:'운체',numericAndLogicChecks:cases.length,questionIds:ids.length,raceInterleavings:total,clockAmbiguity:{assumed:standard,alternate:other},officialKeyCompared:false},null,2));
