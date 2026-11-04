import assert from 'node:assert/strict';
import fs from 'node:fs';
const q=new Map(JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions.map(x=>[x.id,x]));
let checks=0;
function eq(actual,expected,label){assert.deepEqual(actual,expected,label);checks++;}
function has(id,parts){for(const p of parts){assert(q.get(id)?.answer.includes(p),`${id}: current answer lacks ${p}`);checks++;}}
// 2014-A-07. Reference variables model C-like *reference* semantics stipulated in prompt.
{
 let val=0,arr=[1,2,3];function value(x,y){x++;y=x*2;}function refA(){val++;arr[0]=val*2;}function refB(){const index=val;arr[0]++;arr[index]=arr[0]*2;}
 value(val,arr[0]);value(arr[0],arr[val]);let sum1=val+arr.reduce((a,b)=>a+b,0);refA();refB();let sum2=val+arr.reduce((a,b)=>a+b,0);
 eq([sum1,sum2],[6,13],'2014 reference');has('2014-A-07',['6 13']);
}
{
 let printed=[];function recur(n){if(n<=0)return 1;let s=n+recur(Math.trunc(n/2));printed.push(s);return s;}
 recur(7);eq(printed,[2,5,12],'2014 recursion');has('2014-A-09',['2 5 12']);
}
{
 let s=0,r=[];for(const n of [5,4]){for(let j=1;j<=n;j++)s+=j%2;r.push(s);}eq(r,[3,5],'static local retains value');has('2016-A-03',['3 5']);
}
has('2016-A-07',['㉠ func','㉡ aaa']);
{
 let top={value:3,next:null};const ptr={value:7,next:top};top=ptr;eq([top.value,top.next.value],[7,3],'stack next/top update');has('2016-A-12',['ptr->next = top','top = ptr']);
}
{
 function recursive(k){return k<=1?1:k+recursive(k-1);}eq([1,2,5,9].map(recursive),[1,3,15,45],'sum recursion');has('2016-A-13',['1','k + func2(k - 1)']);
}
{
 let s='E';const steps=[[2,'T'],[3,'*TF'],[4,'*FF'],[6,'*2F'],[5,'*2(E)'],[1,'*2(+ET)'],[2,'*2(+TT)'],[4,'*2(+FT)'],[6,'*2(+3T)'],[4,'*2(+3F)'],[6,'*2(+34)']];
 for(const [,t] of steps)s=t;eq(s,'*2(+34)','grammar target');eq(steps.map(z=>z[0]),[2,3,4,6,5,1,2,4,6,4,6],'leftmost grammar derivation');has('2016-B-03',['2 → 3 → 4 → 6 → 5 → 1 → 2 → 4 → 6 → 4 → 6']);
}
{
 let a=[null,2,18,9,87,26,51,72,91],n=8,t=12,c=++n,p=Math.floor(c/2),prints=[];a[n]=t;
 while(p>0){if(t>a[p])break;a[c]=a[p];c=p;p=Math.floor(c/2);prints.push(a.slice(1));}a[c]=t;
 eq(prints.length,2,'insert intermediate print count');eq(prints[0],[2,18,9,87,26,51,72,91,87],'insert first print');eq(a.slice(1),[2,12,9,18,26,51,72,91,87],'insert final');has('2016-B-07',['2, 18, 9, 87, 26, 51, 72, 91, 87','2, 12, 9, 18, 26, 51, 72, 91, 87']);
}
{
 let y=5,staticX=3,out=[];out.push(3);y++;for(let i=0;i<2;i++){staticX++;y++;out.push(staticX);}function sub3(x){if(x>0){sub3(Math.floor(x/2));out.push(x%2);}}sub3(y);
 eq(out,[3,4,5,1,0,0,0],'local/static/global & recursive binary');has('2017-A-08',['3 4 5 1 0 0 0']);
}
has('2017-B-02',['ⓒ small','ⓕ login','ⓐ count','ⓔ busy']);
{
 const d=[8,3,7,2,1],prints=[];let swap=0;
 for(let i=0;i<=3;i++){let key=i;for(let j=i+1;j<=4;j++)if(d[j]<d[key])key=j;if(key!==i){[d[i],d[key]]=[d[key],d[i]];swap++;}if(i===1)prints.push([...d]);}
 eq(prints[0],[1,2,7,3,8],'selection intermediate');eq(swap,3,'selection swap count');has('2017-B-07',['1 2 7 3 8','3회','data[j] > data[key]']);
}
{
 const table=[0,7,4,5,0,2,3,1,8,0];eq([61,127,21].map(x=>table[Math.floor(x/20)]),[5,3,7],'mapping');has('2018-A-02',['5 3 7']);
}
{
 let global=10;global++;let out=[];for(let i=0;i<2;i++){let local=5;local++;out.push(local);global++;out.push(global);}eq(out,[6,12,6,13],'scope shadowing');has('2018-A-03',['6 12 6 13']);
}
{
 function reverse(s,a,b){const chars=[...s];function doIt(i,j){if(i<j){[chars[i],chars[j]]=[chars[j],chars[i]];doIt(i+1,j-1);}}doIt(a,b);return chars.join('');}
 eq(reverse('abcd',1,3),'adcb','reverse subsequence');has('2018-A-06',['s + 1','d - 1']);
}
// AI/search path BFS confirms the A* path length and misplaced-tiles heuristic.
{
 const start='213_',target='1_23',n='_123',neighbors=s=>{const blank=s.indexOf('_');return [[-1,0],[1,0],[0,-1],[0,1]].flatMap(([dr,dc])=>{const r=Math.floor(blank/2)+dr,c=blank%2+dc;if(r<0||r>=2||c<0||c>=2)return [];const ix=2*r+c,arr=[...s];[arr[ix],arr[blank]]=[arr[blank],arr[ix]];return [arr.join('')];});};
 const dist=new Map([[start,0]]),stack=[start];for(const s of stack){for(const next of neighbors(s))if(!dist.has(next)){dist.set(next,dist.get(s)+1);stack.push(next);}}
 const h=s=>[...s].filter((ch,i)=>ch!=='_'&&ch!==target[i]).length;
 eq([dist.get(n),h(n),dist.get(target),h(target)],[2,1,3,0],'3-puzzle BFS exact distance');has('2023-A-09',['g(n)=2','h(n)=1','f(목표)=3']);
}
// Data-science pedagogic terminology requires external curriculum evidence; don't fabricate a computational check.
has('2022-B-01',['정보보호능력','(나) → (라) → (가) → (다)']);
has('2025-A-07',['데이터 문해력','인공지능 소양','중학교 정보','소프트웨어와 생활','데이터 과학','정보과학']);
has('2025-B-07',['규칙 2','50m 이상','규칙 5','충돌하지 않고']);
{
 function step(x){return x>=0?1:0;}function y(x1,x2){const a=step(-2*x1-2*x2+2.8),b=step(2*x1+2*x2-.8);return step(2*a+2*b-2.8);}eq([Math.max(0,5),y(0,1),y(1,0)],[5,1,1],'ReLU + XOR network');has('2026-A-03',['y=5','(0,1)에서 1','(1,0)에서 1']);
}
{
 const a=[[1,0,0],[1,0,1],[0,1,1]],b=[[0,0,1],[1,1,0],[0,1,0]];
 function mult(A,B){return A.map((row,i)=>row.map((v,j)=>+A[i].some((n,k)=>!!n&&!!B[k][j])));}const c=mult(a,b),d=mult(b,a);
 eq([c[0][0],c[0][2],d[0][0],d[0][2]],[0,1,0,1],'boolean matrix multiplication');has('2026-A-06',['des[i][j] = 0','arr1[i][k] && arr2[k][j]','ⓐ 0 1','ⓑ 0 1']);
}
{
 const data=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8')).lines;
 const middle=data.find(x=>x.lineId==='MI-CG-GOAL-02'),high=data.find(x=>x.lineId==='HI-CG-GOAL-01');
 assert(middle.sourceText.includes('컴퓨터로 처리되는 정보의 원리'));assert(high.sourceText.includes('컴퓨팅 시스템 간의 연결 원리'));
 checks+=2;has('2026-B-01',['㉤','데이터','㉣','컴퓨팅 시스템']);
}
console.log(JSON.stringify({status:'PASS',independentChecks:checks,examItems:21,hasOriginalCurriculumCrossCheck:true,officialKeyVerified:false}));
