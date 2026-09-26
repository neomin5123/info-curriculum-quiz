'use strict';
process.env.TZ = 'Asia/Seoul';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const ctx = {window:{}}; vm.createContext(ctx);
for (const file of ['data/curriculum/2022/curriculum.js','data/curriculum/2015/transition-reference.js','data/curriculum/mappings/2015-2022.js','data/learning-aids/general-bank.js']) {
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
const transition2015 = ctx.window.CURRILOOP_CURRICULUM_2015;
const transitionMap = ctx.window.CURRILOOP_CURRICULUM_TRANSITION;
if (!transition2015?.subjects?.['2015-high-info']) throw new Error('2015 transition corpus missing');
if (!Array.isArray(transitionMap?.mappings) || transitionMap.mappings.length < 20) throw new Error('transition mappings missing');
const ids2015 = new Set();
(function walk(x){ if(Array.isArray(x)) return x.forEach(walk); if(x&&typeof x==='object'){ if(typeof x.id==='string') ids2015.add(x.id); Object.values(x).forEach(walk); } })(transition2015);
for (const m of transitionMap.mappings) {
  for (const id of m.from || []) if (!ids2015.has(id)) throw new Error(`invalid 2015 mapping source ${id}`);
  for (const id of m.to || []) if (!ids.has(id)) throw new Error(`invalid 2022 mapping target ${id}`);
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for (const asset of ['/js/engines/day-engine.js?v=8.0.0-rc','/js/engines/learning-engine.js?v=8.0.0-rc','/js/engines/practical-engine.js?v=8.0.0-rc','/js/engines/grading-engine.js?v=8.0.0-rc','/js/engines/recall-engine.js?v=8.0.0-rc','/js/engines/intensity-engine.js?v=8.0.0-rc','/js/engines/structure-engine.js?v=8.0.0-rc','/js/engines/review-engine.js?v=8.0.0-rc','/js/engines/history-engine.js?v=8.0.0-rc','/js/engines/storage-engine.js?v=8.0.0-rc','/js/engines/planner-engine.js?v=8.0.0-rc','/data/questions/production.js?v=8.0.0-rc','/js/practice/practice-engine.js?v=8.0.0-rc','/js/practice/practice-ui.js?v=8.0.0-rc','/js/app.js?v=8.0.0-rc','/data/learning-aids/core-flow.js?v=8.0.0-rc','/data/learning-aids/gap-intensity.js?v=8.0.0-rc','/data/learning-aids/exam-recall-profiles.js?v=8.0.0-rc','/data/curriculum/2015/transition-reference.js?v=8.0.0-rc','/data/curriculum/mappings/2015-2022.js?v=8.0.0-rc']) if(!html.includes(asset)) throw new Error(`missing script ${asset}`);

if(!html.includes('class="brand-home-link"')) throw new Error('brand home link missing');
for (const marker of ['value="content-system"','value="achievement"','value="core-achievement"','value="achievement-guidance"','id="historySort"','value="recent"','value="oldest"']) if(!html.includes(marker)) throw new Error(`missing UI marker ${marker}`);

for (const marker of ['id="structureButton"','구조 연습','id="reviewRecallArea"','id="difficultyField"','id="homePage"','id="todayStartButton"']) if(!html.includes(marker)) throw new Error(`missing v7.5 UI marker ${marker}`);
const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
for (const marker of ['curriloop-daily-review-plan-v2','remainingDailyReviewItems','ensureDailyReviewPlan','curriloop-grading-overrides-v1','curriloop-practical-exam-progress-v1','practicalSetSummary','nextReviewInfo','core-achievement','achievement-guidance','historySort','CORE_FLOW_MAP','핵심 흐름','SOURCE_GROUPS','CurriLoopPracticeBridge','PRACTICE_SOURCE_LINK_KEY','openSourceModalByIds','openCurrentUnitSourceModal','gradeHolisticRecallBlock','renderStructurePractice','recallSectionConceptKey','syncRecallCourseControls','updateRecallSectionMastery','recall-free-input','recall-mastery-badge','RecallEngine.isRecallMastered','IntensityEngine.selectCoreEntries','practicalRecallKind','conceptRecallTargets','retryDistance','renderTodayHome','startPlannedNewStudy','isLongTermReviewEligible','DAILY_STUDY_PLANNER_KEY']) if(!app.includes(marker)) throw new Error(`missing review plan marker ${marker}`);
const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
for (const asset of ['/js/engines/day-engine.js?v=8.0.0-rc','/js/engines/learning-engine.js?v=8.0.0-rc','/js/engines/practical-engine.js?v=8.0.0-rc','/js/engines/grading-engine.js?v=8.0.0-rc','/js/engines/recall-engine.js?v=8.0.0-rc','/js/engines/intensity-engine.js?v=8.0.0-rc','/js/engines/structure-engine.js?v=8.0.0-rc','/js/engines/review-engine.js?v=8.0.0-rc','/js/engines/history-engine.js?v=8.0.0-rc','/js/engines/storage-engine.js?v=8.0.0-rc','/js/engines/planner-engine.js?v=8.0.0-rc','/data/questions/production.js?v=8.0.0-rc','/js/practice/practice-engine.js?v=8.0.0-rc','/js/practice/practice-ui.js?v=8.0.0-rc','/data/learning-aids/core-flow.js?v=8.0.0-rc','/data/learning-aids/gap-intensity.js?v=8.0.0-rc','/data/learning-aids/exam-recall-profiles.js?v=8.0.0-rc','/data/curriculum/2015/transition-reference.js?v=8.0.0-rc','/data/curriculum/mappings/2015-2022.js?v=8.0.0-rc']) if(!sw.includes(asset)) throw new Error(`SW missing ${asset}`);
console.log(JSON.stringify({subjects,areas,lines,gaps,invalid,dupIds},null,2));
