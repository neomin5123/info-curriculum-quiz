'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const ctx = {window:{}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'data/curriculum-data.js'),'utf8'), ctx);
const data = ctx.window.CURRILOOP_CURRICULUM_DATA;
const COMMON_AREA = ctx.window.CURRILOOP_COMMON_AREA || '과목 공통';
const app = fs.readFileSync(path.join(root,'app.js'),'utf8');

const expectedAreas = {
  'middle-info':['컴퓨팅 시스템','데이터','알고리즘과 프로그래밍','인공지능','디지털 문화'],
  'high-info':['컴퓨팅 시스템','데이터','알고리즘과 프로그래밍','인공지능','디지털 문화'],
  'ai-basic':['인공지능의 이해','인공지능과 학습','인공지능의 사회적 영향','인공지능 프로젝트'],
  'data-science':['데이터 과학의 이해','데이터 준비와 분석','데이터 모델링과 평가','데이터 과학 프로젝트'],
  'software-life':['세상을 변화시키는 소프트웨어','창작을 지원하는 소프트웨어','현상을 분석하는 소프트웨어','모의 실험하는 소프트웨어','가치를 창출하는 소프트웨어'],
  'info-science':['프로그래밍','데이터 구조','알고리즘','정보과학 프로젝트']
};
let count=0;
for (const [subject, areas] of Object.entries(expectedAreas)) {
  for (const area of areas) {
    if (!data[subject]?.[area]) throw new Error(`curriculum area missing: ${subject}/${area}`);
    const quotedArea = JSON.stringify(area);
    if (!app.includes(`${quotedArea}: Object.freeze({`)) throw new Error(`core flow missing: ${subject}/${area}`);
    count++;
  }
}
if (count !== 27) throw new Error(`expected 27 core flows, got ${count}`);

for (const required of [
  'if (studyMode !== "original" || area === COMMON_AREA) return null;',
  'flow.kind || "구조형"',
  'flow.summary',
  '(flow.sections || []).forEach',
  '공식 교수·학습 순서나 교육과정 원문 자체를 의미하지 않습니다.'
]) if (!app.includes(required)) throw new Error(`core flow invariant missing: ${required}`);

// Flow metadata must remain separate from official curriculum data.
for (const f of ['data/curriculum-data.js','data/supplemental-data.js']) {
  const src=fs.readFileSync(path.join(root,f),'utf8');
  if (src.includes('CORE_FLOW_MAP') || src.includes('핵심 흐름')) throw new Error(`flow metadata leaked into ${f}`);
}

console.log(`v6.9.3 feature QA: OK (${count} curriculum areas covered)`);
