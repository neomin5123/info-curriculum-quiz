const assert = require('assert');
global.window = {};
require('../../data/curriculum/2022/curriculum.js');
const R = require('../../js/engines/recall-engine.js');
const I = require('../../js/engines/intensity-engine.js');
const C = require('../../data/learning-aids/gap-intensity.js');
const remainingLock = require('./high-info-remaining-source-lock.json');

const subject = window.CURRILOOP_CURRICULUM_DATA['high-info'];
const rows = [];
for (const [area, groups] of Object.entries(subject)) {
  for (const [sourceGroup, sections] of Object.entries(groups)) {
    for (const section of sections) {
      for (const line of section.lines || []) rows.push({area, sourceGroup, section, line});
    }
  }
}
assert.equal(rows.length, 131, 'high-info official sentence count');
const exact = rows.filter(x => R.memoryTier(x.section.title, x.sourceGroup).key === 'exact');
const guided = rows.filter(x => R.memoryTier(x.section.title, x.sourceGroup).key !== 'exact');
assert.equal(exact.length, 52, 'high-info exact-recall sentence count');
assert.equal(guided.length, 79, 'high-info semantic-gap sentence count');
assert.equal(Object.keys(C.lineOverrides || {}).filter(id => id.startsWith('HI-')).length, 79, 'every non-exact high-info line has a semantic override');

for (const {section, sourceGroup, line} of guided) {
  const override = C.lineOverrides[line.id];
  assert(Array.isArray(override) && override.length > 0, `missing semantic override: ${line.id}`);
  const easyEntries = (line.easy || []).map((answer, i) => ({answer, gapId:(line.gapIds?.easy || [])[i]}));
  const normalEntries = (line.normal || []).map((answer, i) => ({answer, gapId:(line.gapIds?.normal || [])[i]}));
  const unionAnswers = new Set([...easyEntries, ...normalEntries].map(x => x.answer));
  for (const answer of override) assert(unionAnswers.has(answer), `override must reuse existing gap inventory: ${line.id} / ${answer}`);
  const seen = new Set();
  const candidates = [...easyEntries, ...normalEntries].filter(entry => {
    const key = String(entry.answer || '').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const selected = I.selectCoreEntries(line, candidates, section.title, sourceGroup, R.memoryTier(section.title, sourceGroup).key);
  assert.deepStrictEqual(selected.map(x => x.answer), candidates.filter(x => override.includes(x.answer)).map(x => x.answer), `semantic override not applied: ${line.id}`);
  const maskedChars = I.hiddenCoverage(line.text, selected);
  assert(maskedChars < 0.55, `semantic core mask hides too much of a line: ${line.id} ${(maskedChars*100).toFixed(1)}%`);
}

for (const {line} of exact) assert(!C.lineOverrides[line.id], `exact-recall line must not be weakened by semantic override: ${line.id}`);


// First two high-school areas are source-locked against the uploaded official
// 교육부 고시 제2022-33호 [별책10] HWP (content system + standards + commentary + considerations).
const expected_ComputerSystemText = new Map([
  ['HI-01-CS-KI-01','하드웨어와 소프트웨어의 유기적 연결을 통해 동작하는 컴퓨팅 시스템은 사회적, 기술적 가치를 높이는 데 활용된다.'],
  ['HI-01-CS-KI-02','네트워크는 여러 개의 컴퓨팅 시스템 간 연결의 원리를 파악하고, 통신을 통해 데이터 공유를 가능하게 한다.'],
  ['HI-01-CS-KN-01','네트워크의 구성'],
  ['HI-01-CS-KN-02','사물인터넷 시스템의 구성 및 동작 원리'],
  ['HI-01-CS-PF-01','컴퓨팅 시스템 간 네트워크를 구성하고 공유 설정하기'],
  ['HI-01-CS-PF-02','문제 해결에 적합한 사물인터넷 시스템 설계하기'],
  ['HI-01-CS-VA-01','협력적 의사 소통을 위해 네트워크 환경을 적극적으로 활용하는 자세'],
  ['HI-01-CS-VA-02','사물인터넷 시스템으로 인한 사회 변화에 대처하는 능동적 태도'],
  ['HI-01-AC-ST-01','[12정01-01] 유무선 네트워크의 특성을 이해하고, 컴퓨팅 시스템 간 공유, 협력, 소통을 위한 네트워크 환경을 구성한다.'],
  ['HI-01-AC-ST-02','[12정01-02] 사물인터넷의 구성과 동작 원리를 분석하고, 사물인터넷 기술로 인한 개인의 삶과 사회의 변화를 예측한다.'],
  ['HI-01-AC-ST-03','[12정01-03] 문제 해결에 적합한 피지컬 컴퓨팅 시스템 장치를 선택하여 사물인터넷 시스템을 설계한다.'],
  ['HI-01-AC-EX-01','[12정01-01] 네트워크의 개념과 구성요소, 유⋅무선 통신의 특성 등을 구체적인 예를 들어 설명하고, 다양한 컴퓨팅 시스템 및 사물인터넷 장치에서 활용 가능한 유⋅무선 네트워크 환경을 구성할 수 있어야 한다.'],
  ['HI-01-AC-CO-01','중학교에서 학습한 피지컬 컴퓨팅 시스템 및 프로그래밍 언어를 활용하거나 ‘알고리즘과 프로그래밍’ 영역과 연계하는 등 학습자의 수준과 학습 환경을 고려하여 교육과정을 재구성할 수 있다.'],
  ['HI-01-AC-CO-02','네트워크 이론이나 유⋅무선 통신 등의 개념적인 내용보다는 사물인터넷 장치를 이해하고 구성하기 위한 관점에서 유⋅무선 네트워크를 활용할 수 있도록 교수⋅학습을 구성하도록 한다.'],
  ['HI-01-AC-CO-03','사물인터넷 시스템 구현 시 복잡한 통신 및 회로 설계 등 피지컬 컴퓨팅 시스템의 하드웨어를 구성하는 내용보다는 네트워크를 통한 데이터의 이동과 이를 활용한 창의적인 아이디어를 구현하는 과정에 중점을 두어 활동을 구성하고, 설계 과정과 구현 결과를 다양한 방식으로 누적한 후 평가하여 최소 성취수준을 보장하도록 한다.'],
]);
const expected_DataText = new Map([
  ['HI-02-CS-KI-01','데이터의 압축과 암호화는 데이터를 효율적으로 관리하고 보호하는 데 도움을 준다.'],
  ['HI-02-CS-KI-02','수집된 데이터 간의 관계를 파악하여 구조화하는 것은 데이터를 통해 새로운 지식을 찾는 데 도움을 준다.'],
  ['HI-02-CS-KI-03','빅데이터 기술을 활용하여 데이터를 수집, 처리, 관리하는 과정에서 윤리적인 문제를 고려해서 수행해야 올바른 결과가 도출된다.'],
  ['HI-02-CS-KN-01','디지털 데이터 압축과 암호화'],
  ['HI-02-CS-KN-02','빅데이터 개념과 분석'],
  ['HI-02-CS-PF-01','디지털 데이터 압축의 효율성을 분석하고 평가하기'],
  ['HI-02-CS-PF-02','암호화 활용사례 탐색하기'],
  ['HI-02-CS-PF-03','빅데이터 기술을 활용하여 데이터를 분석하고 시각화하기'],
  ['HI-02-CS-VA-01','효율적인 데이터 표현의 긍정적 측면을 활용하려는 자세'],
  ['HI-02-CS-VA-02','데이터를 안전하게 관리하고 보호하는 태도'],
  ['HI-02-CS-VA-03','빅데이터 분석의 가치에 대한 사회적, 윤리적 측면의 성찰'],
  ['HI-02-AC-ST-01','[12정02-01] 디지털 데이터 압축의 개념과 필요성을 이해하고, 압축의 효율성을 분석하여 평가한다.'],
  ['HI-02-AC-ST-02','[12정02-02] 암호화의 개념을 이해하고, 암호화를 활용하여 데이터를 안전하게 관리하는 사례를 비교⋅분석한다.'],
  ['HI-02-AC-ST-03','[12정02-03] 빅데이터의 개념과 특징에 대한 이해를 바탕으로, 문제 해결에 적합한 데이터를 수집한다.'],
  ['HI-02-AC-ST-04','[12정02-04] 빅데이터 분석 도구를 활용하여 데이터를 시각화하고 그 의미와 가치를 해석한다.'],
  ['HI-02-AC-EX-01','[12정02-01] 문자, 이미지, 소리 데이터 등의 기본적인 압축 원리를 이해하고 간단한 데이터에 압축 기법을 적용하여 원본 데이터와 품질 및 용량 분석, 압축 방법 간의 효율성을 비교⋅분석할 수 있어야 한다.'],
  ['HI-02-AC-EX-02','[12정02-02] 비교적 간단한 치환형, 전치형 등의 암호 기법을 활용하여 암호화, 복호화의 과정을 이해하고, 데이터 암호화를 활용하는 사례 분석을 통해 개인과 사회를 보호하기 위한 수단으로 암호화의 중요성과 필요성을 설명할 수 있어야 한다.'],
  ['HI-02-AC-CO-01','압축이나 암호화가 실제로 구현되는 과정을 프로그래밍 과정에서 확인할 수 있도록 ‘알고리즘과 프로그래밍’ 영역과 연계하여 교수⋅학습 과정을 설계하도록 한다. 최소 성취수준을 보장하기 위하여 학습자의 수준에 따라 미리 작성된 코드에 데이터를 입력하고 출력되는 결과를 분석하는 활동을 제시할 수 있다.'],
  ['HI-02-AC-CO-02','피지컬 컴퓨팅이나 스마트 기기를 활용한 센서 데이터 수집, 설문조사 등을 통한 직접 수집, 공개된 공공 데이터나 민간 데이터 활용 등 다양한 데이터 수집 방법을 경험할 수 있도록 활동을 구성하며, 빅데이터를 통해 다양한 해석이 가능하도록 프로젝트 방식으로 과제를 수행하고 평가하도록 한다.'],
  ['HI-02-AC-CO-03','데이터의 생성, 저장, 송⋅수신, 활용 등의 활동에 디지털 자원과 전기 에너지가 소요됨을 인식하고, 데이터 압축 및 암호화를 통해 컴퓨팅 자원 절약과 탄소중립 실천에 영향을 미칠 수 있음을 안내하도록 한다.'],
  ['HI-02-AC-CO-04','수집한 데이터와 분석 방법에 따라 특정 문제에 대한 해석이 다를 수 있음을 인정하고, 다른 사람의 의견을 존중하면서 데이터에 기반하여 자신의 주장을 펼치는 민주적인 토의⋅토론 문화를 조성하도록 한다.'],
]);
for (const [areaName, expected] of [['컴퓨팅 시스템', expected_ComputerSystemText], ['데이터', expected_DataText]]) {
  const areaRows = rows.filter(x => x.area === areaName);
  assert.equal(areaRows.length, expected.size, `${areaName} official sentence count`);
  for (const {line} of areaRows) assert.equal(line.text, expected.get(line.id), `${areaName} source drift: ${line.id}`);
}

// Remaining three high-school areas are source-locked from the uploaded official HWP.
assert.equal(remainingLock.sourceSha256, '49183b90ab752dc30c1405555cef2c5db5071044c48656ae1706e374d05585b2', 'official HWP source hash');
assert.equal(Object.keys(remainingLock.sentences || {}).length, 67, 'remaining high-info source-lock sentence count');
for (const {line} of rows.filter(x => /^(HI-03|HI-04|HI-05)-/.test(x.line.id))) {
  assert.equal(line.text, remainingLock.sentences[line.id], `remaining high-info source drift: ${line.id}`);
}

// Common-section source lock: reviewed again against the published 2022 final-draft text
// (character/goals + teaching/learning/evaluation).
const expected_CommonText = new Map([
  ["HI-CG-CHAR-01","고등학교 ‘정보’는 미래 사회가 요구하는 데이터에 대한 이해를 기반으로 소프트웨어와 인공지능에 대한 기본 역량과 자기주도성을 갖도록 한다."],
  ["HI-CG-CHAR-02","컴퓨팅을 통한 문제 해결을 전제로 문제를 발견, 분석, 해결해 가는 컴퓨팅 사고력에 기반하여 지식정보처리, 창의적 사고, 타인과 협업하고 공유하는 협력적 소통 역량과 공동체 역량 등을 갖춘 디지털 민주시민으로 성장하게 한다."],
  ["HI-CG-CHAR-03","중학교 ‘정보’와 연계해 불확실한 미래 사회의 문제를 해결하기 위한 사고력을 강화하고, 정보 과목의 내용이 필요한 분야의 진로를 탐색하여 자신을 성장시키는 데 도움이 되는 능력과 태도를 함양한다."],
  ["HI-CG-GOAL-00","고등학교 ‘정보’는 인공지능과 더불어 살아가게 될 미래 사회에서 독립적으로 살아가는 데 필요한 정보 관련 능력을 함양하여, 다양한 학문 분야 및 실생활에 필요한 컴퓨팅 장치, 정보처리, 인공지능 등과 같은 ‘정보’과의 전문 지식을 기반으로 컴퓨팅 사고력을 함양할 수 있도록 하는 데 중점을 둔다."],
  ["HI-CG-GOAL-01","(1) 디지털 세상을 연결하는 컴퓨팅 시스템 간의 연결 원리를 파악하고, 정보를 다루는 시스템에 의해 처리⋅생성된 결과가 공유되도록 하는 시스템 제어 능력을 기른다."],
  ["HI-CG-GOAL-02","(2) 컴퓨팅을 활용한 문제 해결을 위해 목적에 맞는 데이터를 수집하고, 데이터 간의 관계를 파악하여 구조화하고, 빅데이터를 처리하고 시각화할 수 있는 능력을 기른다."],
  ["HI-CG-GOAL-03","(3) 다양한 학문 분야의 문제 해결에 필요한 데이터의 관계를 모델링하고 알고리즘을 효율적으로 설계하여 프로그램으로 구현, 평가, 개선하는 과정에서 협력과 공유의 문화를 실천하는 태도를 기른다."],
  ["HI-CG-GOAL-04","(4) 지능 에이전트의 관점에서 인공지능을 이해하고, 기계학습을 통한 인공지능으로 문제를 해결하는 방법을 체득하고 적용하는 능력을 기른다."],
  ["HI-CG-GOAL-05","(5) 디지털 기술로 인한 사회의 발전과 변화를 이해하고, 정보 보호와 정보보안의 중요성을 인식하여 실천하는 태도와 능력을 기른다."],
  ["HI-TE-DIR-01","(가) 실제적인 삶의 맥락에서 컴퓨팅을 통해 문제를 해결하도록 하는 학습 과제를 제시하여 학습자가 과제를 스스로 해결하는 과정에서 자연스럽게 컴퓨팅 사고력, 디지털 문화 소양, 인공지능 소양을 함양할 수 있도록 지도한다."],
  ["HI-TE-DIR-03","(나) 학습자의 흥미와 다양성을 고려하여 학습 소재, 학습 환경 및 학습 과정에 대한 선택의 기회를 제공하고, 교수⋅학습의 설계 과정에 학습자 참여 기회를 증진하는 등 학습자 맞춤형 교수⋅학습을 통해 역량 함양을 위한 깊이 있는 학습 지도 방안을 구성한다."],
  ["HI-TE-DIR-04","(다) 정보 과목의 지식⋅이해, 과정⋅기능을 활용하여 민주시민교육, 생태전환 교육 등 현 시대가 당면한 여러 사회문제와 더불어 지속가능발전 등의 범교과 주제를 교수⋅학습 과제로 제시하여 주도성 있는 문제 해결 경험을 제공한다."],
  ["HI-TE-DIR-05","(라) 내용 영역의 배열순서는 예시의 성격으로 중학교에서 이수한 학생의 수준, 학교의 학습 환경 등을 고려하여 교육과정을 자율적으로 재구성한다."],
  ["HI-TE-DIR-02","(마) 온라인 학습 플랫폼을 활용하는 디지털 기반 학습 이력을 활용하여 언제 어디서나 학습의 연장이 가능하도록 하며, 네트워크 기반의 온라인 활동을 통해 협력적으로 문제를 해결할 수 있는 역량을 함양하도록 활동을 구성한다."],
  ["HI-TE-MET-01","(가) 정보 교과 역량을 함양하기 위해 문제기반학습, 프로젝트 기반학습, 디자인기반학습, 짝 프로그래밍, 탐구학습 등 각 영역의 핵심 아이디어를 습득하는 데 적절한 교수⋅학습 방법을 선택하여 활용한다."],
  ["HI-TE-MET-02","(나) 학습자 개인별로 학습하는 속도가 다양할 수 있음을 고려하고, 최소 성취수준을 보장할 수 있도록 학습관리시스템(LMS)을 활용하여 온라인 학습자료를 제작 및 제공함으로써 학습 격차를 최소화하도록 노력한다."],
  ["HI-TE-MET-04","(다) 영역 간 교육과정 재구성을 통해 제시된 문제를 해결하는 문제기반학습과 학습자가 주제를 선정하고 탐구하는 프로젝트 기반학습 방법을 활용하여 의미 있는 학습자 중심의 활동 경험을 제공한다."],
  ["HI-TE-MET-05","(라) 디지털 교육 환경에 적응할 수 있도록 온오프라인 연계 수업, 다양한 디지털 도구의 활용 등을 통해 디지털 도구에 대한 인지적 부담은 최소화하고, 활용에 대한 경험은 높일 수 있도록 수업을 구성한다."],
  ["HI-TE-MET-03","(마) 프로그래밍에서 언어를 암기하여 습득하는 데 집중하기보다는 문제를 해결하는 과정에 초점을 두며, 학습자가 흥미롭게 느낄 실생활이나 교과 관련 주제를 선정하여 과제로 제시하고, 이를 학습자가 스스로 해결하도록 교수⋅학습을 구성한다."],
  ["HI-TE-EVD-01","(가) 평가 항목은 컴퓨팅 사고력, 디지털 문화 소양, 인공지능 소양의 하위 요소를 기반으로 구체화한다."],
  ["HI-TE-EVD-04","(나) 평가 내용은 지식⋅이해뿐 아니라, 과정⋅기능, 가치⋅태도의 측면 등을 다면적으로 반영하고 과정을 중시하는 평가를 통해 학생의 성장과 발달을 돕는 평가를 실현한다."],
  ["HI-TE-EVD-02","(다) 구체적인 평가 루브릭을 학생과 함께 구성하는 과정을 통해 학생이 자신의 학습 수준을 파악하고 스스로 학습을 성찰할 수 있는 기회를 제공하여, 적극적이고 능동적인 학습이 이루어지도록 한다."],
  ["HI-TE-EVD-03","(라) 성취기준의 도달 수준을 파악하기 위한 평가뿐만 아니라 학습한 내용의 전이를 통해 학습한 내용을 적용할 수 있는 과제를 제시하여 이해와 사고를 통합적으로 평가한다."],
  ["HI-TE-EVM-01","(가) 성취기준을 분석하고 재구성하여 지필평가에 국한하지 않고, 학생의 성장에 기여할 수 있는 평가 포트폴리오를 계획한다. 예를 들면, 관찰 평가, 서술형평가, 수행 평가 등을 활용하거나, 자기 평가, 동료 평가 등과 같은 다면적 평가를 실행한다."],
  ["HI-TE-EVM-02","(나) 평가 내용이나 방법에 따라 다양한 디지털 도구(프로그램 자동 평가시스템(online judge 등), 학습관리시스템(LMS) 등)를 활용할 수 있으며, 평가 이전에 학생이 디지털 도구를 다룰 수 있도록 교육하여 평가의 불이익이 없도록 계획한다."],
  ["HI-TE-EVM-03","(다) 실생활 및 다양한 학문 분야에서 해결할 수 있는 문제를 스스로 발견하도록 하고, 학생이 해결하는 수행 과정을 보고서나 포트폴리오 형태로 누적하여 평가가 지속적으로 이루어지고 과정에 초점을 맞추도록 한다."],
  ["HI-TE-EVM-05","(라) 학습 부진, 느린 학습자가 참여할 수 있고, 학습자의 최소 성취수준을 보장할 수 있도록 난이도에 따른 평가기준을 세분화하여 제시한다."],
  ["HI-TE-EVM-04","(마) 문제 해결에 적합한 소프트웨어를 활용하여 데이터 수집, 가공, 분석 등 컴퓨팅 시스템을 통한 과정평가로 디지털 문해력을 함양하도록 한다."],
]);
const commonRows = rows.filter(x => x.area === '과목 공통');
assert.equal(commonRows.length, expected_CommonText.size, 'high-info common official sentence count');
for (const {line} of commonRows) assert.equal(line.text, expected_CommonText.get(line.id), `high-info common source drift: ${line.id}`);

// Common-section semantic locks: keyword/+@ prompts should not become sentence restoration.
assert.deepStrictEqual(C.lineOverrides['HI-CG-CHAR-01'], ['데이터에 대한 이해','자기주도성']);
assert.deepStrictEqual(C.lineOverrides['HI-CG-GOAL-03'], ['데이터의 관계를 모델링','구현, 평가, 개선']);
assert.deepStrictEqual(C.lineOverrides['HI-TE-MET-01'], ['문제기반학습','프로젝트 기반학습','짝 프로그래밍']);
assert.deepStrictEqual(C.lineOverrides['HI-TE-MET-02'], ['최소 성취수준','학습관리시스템(LMS)','학습 격차를 최소화']);
assert.deepStrictEqual(C.lineOverrides['HI-TE-EVD-03'], ['학습한 내용의 전이','통합적으로 평가']);
assert.deepStrictEqual(C.lineOverrides['HI-TE-EVM-04'], ['과정평가','디지털 문해력']);
assert.deepStrictEqual(C.lineOverrides['HI-TE-DIR-03'], ['선택의 기회','학습자 참여 기회','학습자 맞춤형 교수⋅학습']);
assert.deepStrictEqual(C.lineOverrides['HI-TE-DIR-04'], ['현 시대가 당면한 여러 사회문제','지속가능발전','주도성 있는 문제 해결 경험']);
assert.deepStrictEqual(C.lineOverrides['HI-TE-DIR-05'], ['중학교에서 이수한 학생의 수준','학교의 학습 환경','교육과정을 자율적으로 재구성']);
assert.deepStrictEqual(C.lineOverrides['HI-TE-MET-04'], ['영역 간 교육과정 재구성','학습자가 주제를 선정하고 탐구','의미 있는 학습자 중심의 활동 경험']);
assert.deepStrictEqual(C.lineOverrides['HI-TE-MET-05'], ['온오프라인 연계 수업','인지적 부담은 최소화','활용에 대한 경험은 높일']);
assert.deepStrictEqual(C.lineOverrides['HI-TE-EVD-04'], ['과정⋅기능','가치⋅태도','과정을 중시하는 평가']);
assert.deepStrictEqual(C.lineOverrides['HI-TE-EVM-05'], ['학습 부진, 느린 학습자','학습자의 최소 성취수준','난이도에 따른 평가기준을 세분화']);

// Area-level semantic locks: target relations, distinctions and instructional conditions rather than generic nouns.
assert.deepStrictEqual(C.lineOverrides['HI-01-CS-KI-01'], ['유기적 연결','사회적','기술적 가치']);
assert.deepStrictEqual(C.lineOverrides['HI-01-CS-KI-02'], ['연결의 원리','통신','데이터 공유']);
assert.deepStrictEqual(C.lineOverrides['HI-01-CS-VA-01'], ['적극적으로 활용']);
assert.deepStrictEqual(C.lineOverrides['HI-01-CS-VA-02'], ['능동적 태도']);
assert.deepStrictEqual(C.lineOverrides['HI-01-AC-EX-01'], ['유⋅무선 통신','사물인터넷 장치','유⋅무선 네트워크 환경']);
assert.deepStrictEqual(C.lineOverrides['HI-01-AC-CO-01'], ['피지컬 컴퓨팅 시스템','알고리즘과 프로그래밍','학습 환경','재구성']);
assert.deepStrictEqual(C.lineOverrides['HI-01-AC-CO-02'], ['개념적인 내용','사물인터넷 장치','유⋅무선 네트워크']);
assert.deepStrictEqual(C.lineOverrides['HI-01-AC-CO-03'], ['데이터의 이동','창의적인 아이디어','최소 성취수준']);
assert.deepStrictEqual(C.lineOverrides['HI-02-CS-KI-01'], ['압축','암호화','효율적으로 관리']);
assert.deepStrictEqual(C.lineOverrides['HI-02-CS-KI-02'], ['데이터 간의 관계','구조화','새로운 지식']);
assert.deepStrictEqual(C.lineOverrides['HI-02-CS-KI-03'], ['빅데이터 기술','윤리적인 문제','올바른 결과']);
assert.deepStrictEqual(C.lineOverrides['HI-02-CS-VA-01'], ['긍정적 측면']);
assert.deepStrictEqual(C.lineOverrides['HI-02-CS-VA-02'], ['안전하게 관리']);
assert.deepStrictEqual(C.lineOverrides['HI-02-CS-VA-03'], ['성찰']);
assert.deepStrictEqual(C.lineOverrides['HI-02-AC-EX-01'], ['압축 원리','품질','용량','효율성']);
assert.deepStrictEqual(C.lineOverrides['HI-02-AC-EX-02'], ['치환형','전치형','암호화, 복호화','중요성','필요성']);
assert.deepStrictEqual(C.lineOverrides['HI-02-AC-CO-01'], ['알고리즘과 프로그래밍','최소 성취수준','미리 작성된 코드','출력되는 결과']);
assert.deepStrictEqual(C.lineOverrides['HI-02-AC-CO-02'], ['센서 데이터','직접 수집','공공 데이터','민간 데이터']);
assert.deepStrictEqual(C.lineOverrides['HI-02-AC-CO-03'], ['전기 에너지','데이터 압축','암호화','탄소중립']);
assert.deepStrictEqual(C.lineOverrides['HI-02-AC-CO-04'], ['분석 방법','데이터에 기반','토의⋅토론 문화']);

// High-risk lines: lists/distinctions that carry exam-answer value stay explicit; generic wording does not become a gap target.
assert.deepStrictEqual(C.lineOverrides['HI-02-AC-EX-01'], ['압축 원리','품질','용량','효율성']);
assert.deepStrictEqual(C.lineOverrides['HI-02-AC-EX-02'], ['치환형','전치형','암호화, 복호화','중요성','필요성']);
assert.deepStrictEqual(C.lineOverrides['HI-03-AC-EX-01'], ['단순화','구조화','오류']);
assert.deepStrictEqual(C.lineOverrides['HI-04-AC-EX-02'], ['회귀','분류','군집']);
assert.deepStrictEqual(C.lineOverrides['HI-03-AC-CO-04'], ['최소 성취수준','미리 제작된 코드','라이브러리','스스로 학습']);

assert.deepStrictEqual(C.lineOverrides['HI-03-CS-VA-01'], ['적극적으로 표현']);
assert.deepStrictEqual(C.lineOverrides['HI-03-CS-VA-03'], ['실천적 자세']);
assert.deepStrictEqual(C.lineOverrides['HI-03-AC-EX-02'], ['실생활','수행 과정','효율성']);
assert.deepStrictEqual(C.lineOverrides['HI-03-AC-CO-01'], ['추상화 과정','자동화 과정','유기적으로 연결','나선형']);
assert.deepStrictEqual(C.lineOverrides['HI-03-AC-CO-02'], ['대규모 데이터']);
assert.deepStrictEqual(C.lineOverrides['HI-04-CS-KI-01'], ['상호 작용','복잡하고 어려운 문제']);
assert.deepStrictEqual(C.lineOverrides['HI-04-AC-EX-01'], ['인식','학습','추론','행동']);
assert.deepStrictEqual(C.lineOverrides['HI-04-AC-CO-01'], ['자동화','문제 해결','인공지능']);
assert.deepStrictEqual(C.lineOverrides['HI-05-AC-EX-01'], ['정보공개','타인의 정보','오⋅남용 방지 대책','정보 보호 방법']);
assert.deepStrictEqual(C.lineOverrides['HI-05-AC-CO-01'], ['결과물','연관성','진로설계']);
assert.deepStrictEqual(C.lineOverrides['HI-05-AC-CO-02'], ['공급자 측면','사용자 측면','접근제어','서⋅논술형']);

assert.deepStrictEqual(C.lineOverrides['HI-TE-EVD-01'], ['하위 요소']);
assert.deepStrictEqual(C.lineOverrides['HI-TE-EVM-02'], ['프로그램 자동 평가시스템','학습관리시스템','평가의 불이익이 없도록']);

console.log('high-info gap semantic QA passed:', {
  officialSentences: rows.length,
  exactRecall: exact.length,
  semanticOverrides: guided.length
});
