import fs from 'node:fs';
function assert(c,m){if(!c){console.error(m);process.exit(1);}}
const src=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
assert(src.metadata?.schemaVersion===3,'exam schema must be 3');
assert(src.metadata?.imageMode==='pdf-rendered-year-atlas-crops','exam image mode mismatch');
assert(src.metadata?.atlasFiles===12,'expected 12 annual atlas files');
assert(Array.isArray(src.questions),'questions missing');
assert(src.questions.length===269,`expected 269 exam questions, got ${src.questions.length}`);
const expectedSubjects=['교교론','자구알고','논회컴구','디비','데통네트웤','운체','인지머러','프로그래밍','소공','이산수학'];
assert(JSON.stringify(src.metadata?.subjectOrder)===JSON.stringify(expectedSubjects),'subject order mismatch');
const ids=new Set(),atlasRefs=new Set();let segmentCount=0;
for(const q of src.questions){
  assert(q&&typeof q==='object','invalid exam record');
  for(const k of ['id','year','part','question','subject','title','text','solutionStatus'])assert(q[k]!==undefined&&q[k]!==null,`missing ${k} on ${q.id||'unknown'}`);
  assert(!ids.has(q.id),`duplicate exam id ${q.id}`);ids.add(q.id);
  assert(q.year>=2014&&q.year<=2026&&q.year!==2015,`year out of corpus ${q.id}`);
  assert(['A','B'].includes(q.part),`bad part ${q.id}`);
  assert(Number(q.question)>=1,`bad question no ${q.id}`);
  assert(expectedSubjects.includes(q.subject),`unexpected subject ${q.subject} on ${q.id}`);
  assert(Array.isArray(q.topics)&&q.topics.length>0,`topics missing ${q.id}`);
  assert(String(q.text).trim().length>40,`question text too short ${q.id}`);
  assert(['solved','pending'].includes(q.solutionStatus),`bad solution status ${q.id}`);
  assert(Array.isArray(q.images)&&q.images.length>=1,`PDF render missing ${q.id}`);
  for(const im of q.images){
    assert(/^assets\/exams\/atlas-20\d{2}\.webp$/.test(im.atlas||''),`bad atlas path ${q.id}`);
    assert(fs.existsSync(im.atlas),`atlas file missing ${q.id}: ${im.atlas}`);
    assert(Number(im.page)>=1&&Number(im.width)>0&&Number(im.height)>0,`bad crop metadata ${q.id}`);
    assert(Number(im.x)>=0&&Number(im.y)>=0&&Number(im.atlasWidth)>0&&Number(im.atlasHeight)>0,`bad atlas coordinates ${q.id}`);
    assert(Number(im.x)+Number(im.width)<=Number(im.atlasWidth),`crop x overflow ${q.id}`);
    assert(Number(im.y)+Number(im.height)<=Number(im.atlasHeight),`crop y overflow ${q.id}`);
    atlasRefs.add(im.atlas); segmentCount++;
  }
  if(q.solutionStatus==='solved'){
    assert(String(q.answer||'').trim().length>0,`solved answer missing ${q.id}`);
    assert(String(q.solution||'').trim().length>0,`solved explanation missing ${q.id}`);
  }
}
assert(atlasRefs.size===12,`expected 12 referenced atlases, got ${atlasRefs.size}`);
assert(segmentCount===337,`expected 337 atlas crop segments, got ${segmentCount}`);
const legacy=fs.readdirSync('assets/exams').filter(x=>/^20\d{2}-[AB]-\d+-\d+\.webp$/.test(x));
assert(legacy.length===0,`legacy individual exam images remain: ${legacy.length}`);
const counts={};for(const q of src.questions)counts[q.year]=(counts[q.year]||0)+1;
assert(counts[2014]===20,`expected 20 questions in 2014, got ${counts[2014]}`);
for(const y of [2016,2017,2018,2019])assert(counts[y]===22,`expected 22 questions in ${y}, got ${counts[y]}`);
for(const y of [2020,2021,2022,2023,2024,2025,2026])assert(counts[y]===23,`expected 23 questions in ${y}, got ${counts[y]}`);
assert(!counts[2015],'2015 must remain absent from provided corpus');
const solved=src.questions.filter(q=>q.solutionStatus==='solved');
assert(solved.length===src.metadata?.coverage?.solved,`solution count ${solved.length} does not match metadata ${src.metadata?.coverage?.solved}`);
assert(solved.length===231,`expected 231 solutions in this build, got ${solved.length}`);
const mirror=fs.readFileSync('data/generated/exam-data.js','utf8').trim();
assert(mirror.startsWith('window.CURRILOOP_EXAM_DATA='),'exam JS mirror prefix missing');
const mirrored=JSON.parse(mirror.slice('window.CURRILOOP_EXAM_DATA='.length,-1));
assert(mirrored.metadata?.schemaVersion===3,'exam mirror schema mismatch');
assert(mirrored.questions.length===src.questions.length,'exam mirror count mismatch');
assert(JSON.stringify(mirrored)===JSON.stringify(src),'exam JS mirror differs from canonical JSON');
const html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('js/app.js','utf8'),css=fs.readFileSync('assets/css/app.css','utf8');
for(const token of ['examMainTab','examYearSelect','examSubjectSelect','examTopicSelect','examSearchInput','examQuestionList','examDetail'])assert(html.includes(token),`exam HTML missing ${token}`);
for(const token of ['renderExamPage','examFilteredQuestions','selectExamQuestion','subjectOrder','exam-problem-images','exam-atlas-crop','CURRILOOP_EXAM_DATA'])assert(app.includes(token),`exam app missing ${token}`);
for(const token of ['.exam-card','.exam-layout','.exam-question-row','.exam-problem-image','.exam-atlas-crop svg','.exam-text-fallback','.exam-solution-box'])assert(css.includes(token),`exam CSS missing ${token}`);
console.log(JSON.stringify({status:'PASS',questions:src.questions.length,solved:solved.length,segments:segmentCount,atlases:atlasRefs.size,years:counts,subjects:expectedSubjects},null,2));
