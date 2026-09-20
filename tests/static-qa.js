'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const ctx = {window:{}}; vm.createContext(ctx);
for (const file of ['data/curriculum-data.js','data/supplemental-data.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'), ctx, {filename:file});
}
const data = ctx.window.CURRILOOP_CURRICULUM_DATA;
if (!data) throw new Error('curriculum missing');
let subjects=0, areas=0, lines=0, gaps=0, invalid=0, dupIds=0;
const ids = new Set();
for (const [subject, subjectData] of Object.entries(data)) {
  subjects++;
  for (const [area, groups] of Object.entries(subjectData)) {
    areas++;
    for (const [group, sections] of Object.entries(groups)) {
      if (!Array.isArray(sections)) continue;
      for (const section of sections) for (const line of section.lines || []) {
        lines++;
        if (ids.has(line.id)) dupIds++; else ids.add(line.id);
        for (const level of ['easy','normal']) {
          const arr=line[level]||[], gid=line.gapIds?.[level]||[];
          gaps += arr.length;
          if (gid.length !== arr.length) invalid++;
          arr.forEach(a=>{ if (!line.text.includes(a)) invalid++; });
        }
      }
    }
  }
}
if (subjects !== 6) throw new Error(`subjects ${subjects}`);
if (invalid) throw new Error(`invalid gaps ${invalid}`);
if (dupIds) throw new Error(`duplicate line ids ${dupIds}`);
let achievementAreas=0;
for (const subjectData of Object.values(data)) {
  for (const [areaName, groups] of Object.entries(subjectData)) {
    if (!Array.isArray(groups.achievement)) continue;
    achievementAreas++;
    const standard = groups.achievement.filter(section => String(section?.title || '').trim() === '성취기준');
    const guidance = groups.achievement.filter(section => {
      const title = String(section?.title || '');
      return title.includes('성취기준 해설') || title.includes('성취기준 적용 시 고려');
    });
    if (standard.length !== 1) throw new Error(`achievement standard split ${areaName}: ${standard.length}`);
    if (standard.length + guidance.length !== groups.achievement.length) throw new Error(`achievement grouping leaves unmatched section in ${areaName}`);
  }
}
if (!achievementAreas) throw new Error('achievement split QA found no areas');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for (const asset of ['/js/learning-engine.js?v=6.18.0','/js/practical-engine.js?v=6.18.0','/js/grading-engine.js?v=6.18.0','/js/review-engine.js?v=6.18.0','/js/history-engine.js?v=6.18.0','/js/storage-engine.js?v=6.18.0','/data/practice-bank.js?v=6.18.0','/js/practice-engine.js?v=6.18.0','/js/practice-ui.js?v=6.18.0','/app.js?v=6.18.0']) if(!html.includes(asset)) throw new Error(`missing script ${asset}`);

if(!html.includes('class="brand-home-link"')) throw new Error('brand home link missing');
for (const marker of ['value="content-system"','value="achievement"','value="core-achievement"','value="achievement-guidance"','id="historySort"','value="recent"','value="oldest"']) if(!html.includes(marker)) throw new Error(`missing UI marker ${marker}`);
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
for (const marker of ['curriloop-daily-review-plan-v1','remainingDailyReviewItems','ensureDailyReviewPlan','curriloop-grading-overrides-v1','curriloop-practical-exam-progress-v1','practicalSetSummary','nextReviewInfo','core-achievement','achievement-guidance','historySort','CORE_FLOW_MAP','핵심 흐름','SOURCE_GROUPS','CurriLoopPracticeBridge','PRACTICE_SOURCE_LINK_KEY','openSourceModalByIds','openCurrentUnitSourceModal']) if(!app.includes(marker)) throw new Error(`missing review plan marker ${marker}`);
const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
for (const asset of ['/js/learning-engine.js?v=6.18.0','/js/practical-engine.js?v=6.18.0','/js/grading-engine.js?v=6.18.0','/js/review-engine.js?v=6.18.0','/js/history-engine.js?v=6.18.0','/js/storage-engine.js?v=6.18.0','/data/practice-bank.js?v=6.18.0','/js/practice-engine.js?v=6.18.0','/js/practice-ui.js?v=6.18.0']) if(!sw.includes(asset)) throw new Error(`SW missing ${asset}`);
console.log(JSON.stringify({subjects,areas,lines,gaps,invalid,dupIds},null,2));
