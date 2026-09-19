'use strict';
const fs=require('fs'); const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const ui=fs.readFileSync(path.join(root,'js/practice-ui.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const storage=fs.readFileSync(path.join(root,'js/storage-engine.js'),'utf8');
const requiredHtml=[
  'id="sourceModalBackdrop"','id="sourceModalBody"','id="sourceModalOfficialLink"',
  'onclick="openCurrentUnitSourceModal()"','id="practiceWeakLinkButton"','근거 원문 보기'
];
for(const marker of requiredHtml) if(!html.includes(marker)) throw new Error(`v611 html missing ${marker}`);
const requiredApp=[
  'PRACTICE_SOURCE_LINK_KEY','window.CurriLoopPracticeBridge','recordPracticeLinkedGrade',
  'representativeConceptForSource','injectPracticeLinkedReview','practiceLinkPending',
  'openSourceModalByIds','openCurrentUnitSourceModal','window.CurriLoopSourceModal',
  'practiceSourceLink:loadPracticeSourceLinkState()','practiceQuestionStats:loadLocalRecord(PRACTICE_QUESTION_STATS_KEY)'
];
for(const marker of requiredApp) if(!app.includes(marker)) throw new Error(`v611 app missing ${marker}`);
for(const marker of ['togglePracticeWeakLink','weightedQuestionIds','CurriLoopSourceModal?.openIds','lastGradeSignature','취약 연동']) if(!ui.includes(marker)) throw new Error(`v611 practice UI missing ${marker}`);
for(const marker of ['.source-modal {','.source-modal-line.highlighted','.practice-link-note','#practiceWeakLinkButton.active']) if(!css.includes(marker)) throw new Error(`v611 css missing ${marker}`);
for(const marker of ['/js/practice-ui.js?v=6.12.0','/app.js?v=6.12.0']) if(!sw.includes(marker)) throw new Error(`v611 feature asset missing ${marker}`);
if(!storage.includes('BACKUP_SCHEMA_VERSION = 9') || !storage.includes('practiceSourceLink') || !storage.includes('practiceQuestionStats')) throw new Error('v611 backup schema not upgraded');
console.log('v6.11.1 feature QA: OK (source modal + weakness bridge + draft restore + backup v9)');

// practice draft persistence
const assert=require('assert');
const practiceUi = fs.readFileSync(path.join(root,'js/practice-ui.js'),'utf8');
assert(practiceUi.includes('drafts = {}') && practiceUi.includes('scheduleDraftPersist') && practiceUi.includes('restoreDraft(q)'), 'practice draft persistence missing');
