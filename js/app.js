(function(){
'use strict';
const BASE_DATA=window.CURRILOOP_STUDY_DATA,CL=window.CurriLoop;if(!BASE_DATA||!CL)throw new Error('CurriLoop data/core failed to load.');
const AI_DATA=window.CURRILOOP_AI_BASIC_DATA;
const DS_DATA=window.CURRILOOP_DATA_SCIENCE_DATA;
const EXTRA_DATA=[AI_DATA,DS_DATA].filter(Boolean);
const DATA=EXTRA_DATA.reduce((acc,d)=>({...acc,lines:[...acc.lines,...d.lines],knowledgeUnderstandingGroups:[...(acc.knowledgeUnderstandingGroups||[]),...(d.knowledgeUnderstandingGroups||[])]}),BASE_DATA);
const CLOZE43_OVERRIDES={"MI-01-CS-PF-01":{"version":"v9.0.38","units":[{"unitId":"MI-01-CS-PF-01-PU-01","text":"구성요소를 파악하고,","start":9,"end":20,"unitType":"phrase","sourceKeywordIds":["MI-01-CS-PF-01-K01"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_SEMANTIC_AUDIT"},{"unitId":"MI-01-CS-PF-01-PU-02-Q43-21","text":"동작 원리","start":21,"end":26,"unitType":"phrase","sourceKeywordIds":["MI-01-CS-PF-01-K02","MI-01-CS-PF-01-K03"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_SEMANTIC_AUDIT"},{"unitId":"MI-01-CS-PF-01-PU-02-Q43-28","text":"운영 체제","start":28,"end":33,"unitType":"phrase","sourceKeywordIds":["MI-01-CS-PF-01-K02","MI-01-CS-PF-01-K03"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_SEMANTIC_AUDIT"}],"coreSets":[{"setId":"MI-01-CS-PF-01-PC-01","unitIds":["MI-01-CS-PF-01-PU-01"],"blankCount":1,"basis":"single presentation unit"},{"setId":"MI-01-CS-PF-01-PC-02","unitIds":["MI-01-CS-PF-01-PU-02-Q43-21","MI-01-CS-PF-01-PU-02-Q43-28"],"blankCount":1,"basis":"single presentation unit"}],"practicalSets":[{"setId":"MI-01-CS-PF-01-PP-01","unitIds":["MI-01-CS-PF-01-PU-01","MI-01-CS-PF-01-PU-02-Q43-21","MI-01-CS-PF-01-PU-02-Q43-28"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-01-AC-ST-03":{"version":"v9.0.38","units":[{"unitId":"MI-01-AC-ST-03-PU-01-Q43-23","text":"피지컬 컴퓨팅 구성요소","start":23,"end":35,"unitType":"phrase","sourceKeywordIds":["MI-01-AC-ST-03-K01"],"stage3RGrades":["A"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_A_STRUCTURE_AUDIT"}],"coreSets":[{"setId":"MI-01-AC-ST-03-PC-01","unitIds":["MI-01-AC-ST-03-PU-01-Q43-23"],"blankCount":1,"basis":"single presentation unit"}],"practicalSets":[{"setId":"MI-01-AC-ST-03-PP-01","unitIds":["MI-01-AC-ST-03-PU-01-Q43-23"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-03-CS-KI-03":{"version":"v9.0.38","units":[{"unitId":"MI-03-CS-KI-03-PU-01","text":"프로그램 개발","start":0,"end":7,"unitType":"phrase","sourceKeywordIds":["MI-03-CS-KI-03-K01"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_SEMANTIC_AUDIT"},{"unitId":"MI-03-CS-KI-03-PU-02-Q43-9","text":"협력이 필요","start":9,"end":15,"unitType":"phrase","sourceKeywordIds":["MI-03-CS-KI-03-K02"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_SEMANTIC_AUDIT"},{"unitId":"MI-03-CS-KI-03-PU-03","text":"공유하는 문화","start":19,"end":26,"unitType":"phrase","sourceKeywordIds":["MI-03-CS-KI-03-K03"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_SEMANTIC_AUDIT"}],"coreSets":[{"setId":"MI-03-CS-KI-03-PC-01","unitIds":["MI-03-CS-KI-03-PU-01"],"blankCount":1,"basis":"single presentation unit"},{"setId":"MI-03-CS-KI-03-PC-02","unitIds":["MI-03-CS-KI-03-PU-02-Q43-9"],"blankCount":1,"basis":"single presentation unit"},{"setId":"MI-03-CS-KI-03-PC-03","unitIds":["MI-03-CS-KI-03-PU-03"],"blankCount":1,"basis":"single presentation unit"}],"practicalSets":[{"setId":"MI-03-CS-KI-03-PP-01","unitIds":["MI-03-CS-KI-03-PU-01","MI-03-CS-KI-03-PU-02-Q43-9"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"MI-03-CS-KI-03-PP-02","unitIds":["MI-03-CS-KI-03-PU-02-Q43-9","MI-03-CS-KI-03-PU-03"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"MI-03-CS-KI-03-PP-03","unitIds":["MI-03-CS-KI-03-PU-01","MI-03-CS-KI-03-PU-02-Q43-9","MI-03-CS-KI-03-PU-03"],"blankCount":3,"basis":"representative pair/triple; no exhaustive combinations"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-03-AC-EX-01":{"version":"v9.0.38","units":[{"unitId":"MI-03-AC-EX-01-PU-01","text":"알고리즘","start":19,"end":23,"unitType":"term","sourceKeywordIds":["MI-03-AC-EX-01-K01"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"LEGACY_ACTIVE_TARGET"},{"unitId":"MI-03-AC-EX-01-PU-02","text":"효과적이고 효율적으로","start":67,"end":78,"unitType":"phrase","sourceKeywordIds":["MI-03-AC-EX-01-K02"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"LEGACY_ACTIVE_TARGET"},{"unitId":"MI-03-AC-EX-01-PU-03-Q43-119","text":"어떠한 장단점","start":119,"end":126,"unitType":"phrase","sourceKeywordIds":["MI-03-AC-EX-01-K03","MI-03-AC-EX-01-K04"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_GRANULARITY_REAUDIT"},{"unitId":"MI-03-AC-EX-01-PU-04","text":"비교⋅분석하여 논리적으로 설명","start":135,"end":151,"unitType":"phrase","sourceKeywordIds":["MI-03-AC-EX-01-K05","MI-03-AC-EX-01-K07"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_GRANULARITY_REAUDIT"}],"coreSets":[{"setId":"MI-03-AC-EX-01-PC-01","unitIds":["MI-03-AC-EX-01-PU-01"],"blankCount":1,"basis":"single presentation unit"},{"setId":"MI-03-AC-EX-01-PC-02","unitIds":["MI-03-AC-EX-01-PU-02"],"blankCount":1,"basis":"single presentation unit"},{"setId":"MI-03-AC-EX-01-PC-03","unitIds":["MI-03-AC-EX-01-PU-03-Q43-119"],"blankCount":1,"basis":"single presentation unit"},{"setId":"MI-03-AC-EX-01-PC-04","unitIds":["MI-03-AC-EX-01-PU-04"],"blankCount":1,"basis":"single presentation unit"}],"practicalSets":[{"setId":"MI-03-AC-EX-01-PP-01","unitIds":["MI-03-AC-EX-01-PU-01","MI-03-AC-EX-01-PU-02"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"MI-03-AC-EX-01-PP-02","unitIds":["MI-03-AC-EX-01-PU-03-Q43-119","MI-03-AC-EX-01-PU-04"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"MI-03-AC-EX-01-PP-03","unitIds":["MI-03-AC-EX-01-PU-02","MI-03-AC-EX-01-PU-03-Q43-119"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"MI-03-AC-EX-01-PP-04","unitIds":["MI-03-AC-EX-01-PU-01","MI-03-AC-EX-01-PU-02","MI-03-AC-EX-01-PU-03-Q43-119"],"blankCount":3,"basis":"representative pair/triple; no exhaustive combinations"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-03-AC-EX-03":{"version":"v9.0.38","units":[{"unitId":"MI-03-AC-EX-03-PU-01","text":"입력된 데이터를 처리","start":10,"end":21,"unitType":"phrase","sourceKeywordIds":["MI-03-AC-EX-03-K01"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"EXPERT_GRANULARITY_OVERRIDE"},{"unitId":"MI-03-AC-EX-03-PU-02","text":"배열이나 리스트","start":63,"end":71,"unitType":"term","sourceKeywordIds":["MI-03-AC-EX-03-K02","MI-03-AC-EX-03-K03"],"stage3RGrades":["A","B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"EXPERT_GRANULARITY_OVERRIDE"},{"unitId":"MI-03-AC-EX-03-PU-03-Q43-79","text":"순차적으로 저장할 수 있는 구조","start":79,"end":96,"unitType":"phrase","sourceKeywordIds":["MI-03-AC-EX-03-K04","MI-03-AC-EX-03-K06"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_GRANULARITY_REAUDIT"},{"unitId":"MI-03-AC-EX-03-PU-03-Q43-103","text":"많은 양의 데이터","start":103,"end":112,"unitType":"phrase","sourceKeywordIds":["MI-03-AC-EX-03-K04","MI-03-AC-EX-03-K06"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_GRANULARITY_REAUDIT"}],"coreSets":[{"setId":"MI-03-AC-EX-03-PC-01","unitIds":["MI-03-AC-EX-03-PU-01"],"blankCount":1,"basis":"single presentation unit"},{"setId":"MI-03-AC-EX-03-PC-02","unitIds":["MI-03-AC-EX-03-PU-02"],"blankCount":1,"basis":"single presentation unit"},{"setId":"MI-03-AC-EX-03-PC-03","unitIds":["MI-03-AC-EX-03-PU-03-Q43-79","MI-03-AC-EX-03-PU-03-Q43-103"],"blankCount":1,"basis":"single presentation unit"}],"practicalSets":[{"setId":"MI-03-AC-EX-03-PP-01","unitIds":["MI-03-AC-EX-03-PU-01","MI-03-AC-EX-03-PU-02"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"MI-03-AC-EX-03-PP-02","unitIds":["MI-03-AC-EX-03-PU-02","MI-03-AC-EX-03-PU-03-Q43-79","MI-03-AC-EX-03-PU-03-Q43-103"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"MI-03-AC-EX-03-PP-03","unitIds":["MI-03-AC-EX-03-PU-01","MI-03-AC-EX-03-PU-02","MI-03-AC-EX-03-PU-03-Q43-79"],"blankCount":3,"basis":"representative pair/triple; no exhaustive combinations"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-04-CS-KI-02":{"version":"v9.0.38","units":[{"unitId":"MI-04-CS-KI-02-PU-01","text":"데이터를 기반으로","start":6,"end":15,"unitType":"phrase","sourceKeywordIds":["MI-04-CS-KI-02-K01"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"LEGACY_ACTIVE_TARGET"},{"unitId":"MI-04-CS-KI-02-PU-02-Q43-49","text":"윤리적 편향성","start":49,"end":56,"unitType":"phrase","sourceKeywordIds":["MI-04-CS-KI-02-K02","MI-04-CS-KI-02-K03"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_GRANULARITY_REAUDIT"}],"coreSets":[{"setId":"MI-04-CS-KI-02-PC-01","unitIds":["MI-04-CS-KI-02-PU-01"],"blankCount":1,"basis":"single presentation unit"},{"setId":"MI-04-CS-KI-02-PC-02","unitIds":["MI-04-CS-KI-02-PU-02-Q43-49"],"blankCount":1,"basis":"single presentation unit"}],"practicalSets":[{"setId":"MI-04-CS-KI-02-PP-01","unitIds":["MI-04-CS-KI-02-PU-01","MI-04-CS-KI-02-PU-02-Q43-49"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-01-CS-KI-02":{"version":"v9.0.38","units":[{"unitId":"HI-01-CS-KI-02-PU-01","text":"네트워크","start":0,"end":4,"unitType":"term","sourceKeywordIds":["HI-01-CS-KI-02-K01"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_GRANULARITY_REAUDIT"},{"unitId":"HI-01-CS-KI-02-PU-02-Q43-22","text":"연결의 원리","start":22,"end":28,"unitType":"phrase","sourceKeywordIds":["HI-01-CS-KI-02-K02","HI-01-CS-KI-02-K03"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_GRANULARITY_REAUDIT"},{"unitId":"HI-01-CS-KI-02-PU-03","text":"데이터 공유","start":43,"end":49,"unitType":"term","sourceKeywordIds":["HI-01-CS-KI-02-K04"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"EXPERT_GRANULARITY_OVERRIDE"}],"coreSets":[{"setId":"HI-01-CS-KI-02-PC-01","unitIds":["HI-01-CS-KI-02-PU-01"],"blankCount":1,"basis":"single presentation unit"},{"setId":"HI-01-CS-KI-02-PC-02","unitIds":["HI-01-CS-KI-02-PU-02-Q43-22"],"blankCount":1,"basis":"single presentation unit"},{"setId":"HI-01-CS-KI-02-PC-03","unitIds":["HI-01-CS-KI-02-PU-03"],"blankCount":1,"basis":"single presentation unit"}],"practicalSets":[{"setId":"HI-01-CS-KI-02-PP-01","unitIds":["HI-01-CS-KI-02-PU-01","HI-01-CS-KI-02-PU-02-Q43-22"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"HI-01-CS-KI-02-PP-02","unitIds":["HI-01-CS-KI-02-PU-02-Q43-22","HI-01-CS-KI-02-PU-03"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"HI-01-CS-KI-02-PP-03","unitIds":["HI-01-CS-KI-02-PU-01","HI-01-CS-KI-02-PU-02-Q43-22","HI-01-CS-KI-02-PU-03"],"blankCount":3,"basis":"representative pair/triple; no exhaustive combinations"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-02-CS-KI-01":{"version":"v9.0.38","units":[{"unitId":"HI-02-CS-KI-01-PU-01","text":"압축","start":5,"end":7,"unitType":"term","sourceKeywordIds":["HI-02-CS-KI-01-K01"],"stage3RGrades":["B","S"],"directHistoricalEvidence":[{"historicalAtomId":"2026-B-Q09-U01-A01","historicalUnitId":"2026-B-Q09-U01","year":2026,"paper":"B","question":9,"retrievalDemand":"production","responseDemand":"exact","examProvision":"not-provided","answerPrecision":"exact-term","historicalPattern":"DIRECT_CLOZE_EXACT","atom":"압축"}],"sourceFaithful":true,"presentationBasis":"EXPERT_GRANULARITY_OVERRIDE"},{"unitId":"HI-02-CS-KI-01-PU-02","text":"암호화","start":9,"end":12,"unitType":"term","sourceKeywordIds":["HI-02-CS-KI-01-K02"],"stage3RGrades":["B","S"],"directHistoricalEvidence":[{"historicalAtomId":"2026-B-Q09-U01-A02","historicalUnitId":"2026-B-Q09-U01","year":2026,"paper":"B","question":9,"retrievalDemand":"production","responseDemand":"exact","examProvision":"not-provided","answerPrecision":"exact-term","historicalPattern":"DIRECT_CLOZE_EXACT","atom":"암호화"}],"sourceFaithful":true,"presentationBasis":"EXPERT_GRANULARITY_OVERRIDE"},{"unitId":"HI-02-CS-KI-01-PU-03-Q43-19","text":"효율적으로 관리","start":19,"end":27,"unitType":"phrase","sourceKeywordIds":["HI-02-CS-KI-01-K03"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_SEMANTIC_AUDIT"}],"coreSets":[{"setId":"HI-02-CS-KI-01-PC-01","unitIds":["HI-02-CS-KI-01-PU-01"],"blankCount":1,"basis":"single presentation unit"},{"setId":"HI-02-CS-KI-01-PC-02","unitIds":["HI-02-CS-KI-01-PU-02"],"blankCount":1,"basis":"single presentation unit"},{"setId":"HI-02-CS-KI-01-PC-03","unitIds":["HI-02-CS-KI-01-PU-03-Q43-19"],"blankCount":1,"basis":"single presentation unit"}],"practicalSets":[{"setId":"HI-02-CS-KI-01-PP-01","unitIds":["HI-02-CS-KI-01-PU-01","HI-02-CS-KI-01-PU-02"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"HI-02-CS-KI-01-PP-02","unitIds":["HI-02-CS-KI-01-PU-02","HI-02-CS-KI-01-PU-03-Q43-19"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"HI-02-CS-KI-01-PP-03","unitIds":["HI-02-CS-KI-01-PU-01","HI-02-CS-KI-01-PU-02","HI-02-CS-KI-01-PU-03-Q43-19"],"blankCount":3,"basis":"representative pair/triple; no exhaustive combinations"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-03-AC-ST-02":{"version":"v9.0.38","units":[{"unitId":"HI-03-AC-ST-02-PU-01-Q43-31","text":"특징과 효율","start":31,"end":37,"unitType":"phrase","sourceKeywordIds":["HI-03-AC-ST-02-K01"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_GRANULARITY_REAUDIT"},{"unitId":"HI-03-AC-ST-02-PU-01-Q43-39","text":"비교⋅분석","start":39,"end":44,"unitType":"phrase","sourceKeywordIds":["HI-03-AC-ST-02-K01"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_GRANULARITY_REAUDIT"}],"coreSets":[{"setId":"HI-03-AC-ST-02-PC-01","unitIds":["HI-03-AC-ST-02-PU-01-Q43-31","HI-03-AC-ST-02-PU-01-Q43-39"],"blankCount":1,"basis":"single presentation unit"}],"practicalSets":[],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-03-AC-EX-03":{"version":"v9.0.38","units":[{"unitId":"HI-03-AC-EX-03-PU-01-Q43-25","text":"객체 지향의 기본 개념","start":25,"end":37,"unitType":"phrase","sourceKeywordIds":["HI-03-AC-EX-03-K02","HI-03-AC-EX-03-K03","HI-03-AC-EX-03-K04"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_GRANULARITY_REAUDIT"},{"unitId":"HI-03-AC-EX-03-PU-02","text":"클래스와 객체","start":63,"end":70,"unitType":"term","sourceKeywordIds":["HI-03-AC-EX-03-K05"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"EXPERT_GRANULARITY_OVERRIDE"},{"unitId":"HI-03-AC-EX-03-PU-03","text":"프로그램 구현","start":87,"end":94,"unitType":"term","sourceKeywordIds":["HI-03-AC-EX-03-K07"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"EXPERT_GRANULARITY_OVERRIDE"}],"coreSets":[{"setId":"HI-03-AC-EX-03-PC-01","unitIds":["HI-03-AC-EX-03-PU-01-Q43-25"],"blankCount":1,"basis":"single presentation unit"},{"setId":"HI-03-AC-EX-03-PC-02","unitIds":["HI-03-AC-EX-03-PU-02"],"blankCount":1,"basis":"single presentation unit"},{"setId":"HI-03-AC-EX-03-PC-03","unitIds":["HI-03-AC-EX-03-PU-03"],"blankCount":1,"basis":"single presentation unit"}],"practicalSets":[{"setId":"HI-03-AC-EX-03-PP-01","unitIds":["HI-03-AC-EX-03-PU-01-Q43-25","HI-03-AC-EX-03-PU-02"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"HI-03-AC-EX-03-PP-02","unitIds":["HI-03-AC-EX-03-PU-02","HI-03-AC-EX-03-PU-03"],"blankCount":2,"basis":"representative pair/triple; no exhaustive combinations"},{"setId":"HI-03-AC-EX-03-PP-03","unitIds":["HI-03-AC-EX-03-PU-01-Q43-25","HI-03-AC-EX-03-PU-02","HI-03-AC-EX-03-PU-03"],"blankCount":3,"basis":"representative pair/triple; no exhaustive combinations"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-04-CS-PF-01":{"version":"v9.0.38","units":[{"unitId":"HI-04-CS-PF-01-PU-01-Q43-16","text":"지능 에이전트","start":16,"end":23,"unitType":"phrase","sourceKeywordIds":["HI-04-CS-PF-01-K01","HI-04-CS-PF-01-K02"],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"V9.0.38_GRANULARITY_REAUDIT"}],"coreSets":[{"setId":"HI-04-CS-PF-01-PC-01","unitIds":["HI-04-CS-PF-01-PU-01-Q43-16"],"blankCount":1,"basis":"single presentation unit"}],"practicalSets":[],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true}};
for(const line of DATA.lines){if(CLOZE43_OVERRIDES[line.lineId])line.presentation=CLOZE43_OVERRIDES[line.lineId];}
const CLOZE44_OVERRIDES={"MI-02-CS-KI-03":{"version":"v9.0.44","units":[{"unitId":"MI-02-CS-KI-03-B44-1","text":"관계를 파악하고","start":11,"end":19,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"},{"unitId":"MI-02-CS-KI-03-B44-2","text":"구조화","start":21,"end":24,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"MI-02-CS-KI-03-B44C-1","unitIds":["MI-02-CS-KI-03-B44-1"],"blankCount":1,"basis":"one atomic concept"},{"setId":"MI-02-CS-KI-03-B44C-2","unitIds":["MI-02-CS-KI-03-B44-2"],"blankCount":1,"basis":"one atomic concept"}],"practicalSets":[{"setId":"MI-02-CS-KI-03-B44P-1","unitIds":["MI-02-CS-KI-03-B44-1","MI-02-CS-KI-03-B44-2"],"blankCount":2,"basis":"two source-anchored concepts"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-02-CS-PF-03":{"version":"v9.0.44","units":[{"unitId":"MI-02-CS-PF-03-B44-1","text":"구조화하고","start":5,"end":10,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"},{"unitId":"MI-02-CS-PF-03-B44-2","text":"의미 해석하기","start":11,"end":18,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"MI-02-CS-PF-03-B44C-1","unitIds":["MI-02-CS-PF-03-B44-1"],"blankCount":1,"basis":"one atomic concept"},{"setId":"MI-02-CS-PF-03-B44C-2","unitIds":["MI-02-CS-PF-03-B44-2"],"blankCount":1,"basis":"one atomic concept"}],"practicalSets":[{"setId":"MI-02-CS-PF-03-B44P-1","unitIds":["MI-02-CS-PF-03-B44-1","MI-02-CS-PF-03-B44-2"],"blankCount":2,"basis":"two source-anchored concepts"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-02-AC-EX-02":{"version":"v9.0.44","units":[{"unitId":"MI-02-AC-EX-02-B44-1","text":"데이터를 구분하여","start":126,"end":135,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"},{"unitId":"MI-02-AC-EX-02-B44-2","text":"저장하고 활용","start":136,"end":143,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"MI-02-AC-EX-02-B44C-1","unitIds":["MI-02-AC-EX-02-B44-1"],"blankCount":1,"basis":"one atomic concept"},{"setId":"MI-02-AC-EX-02-B44C-2","unitIds":["MI-02-AC-EX-02-B44-2"],"blankCount":1,"basis":"one atomic concept"}],"practicalSets":[{"setId":"MI-02-AC-EX-02-B44P-1","unitIds":["MI-02-AC-EX-02-B44-1","MI-02-AC-EX-02-B44-2"],"blankCount":2,"basis":"two source-anchored concepts"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-03-CS-PF-02":{"version":"v9.0.44","units":[{"unitId":"MI-03-CS-PF-02-B44-1","text":"알고리즘을 설계하고","start":14,"end":24,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"},{"unitId":"MI-03-CS-PF-02-B44-2","text":"적용하기","start":25,"end":29,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"MI-03-CS-PF-02-B44C-1","unitIds":["MI-03-CS-PF-02-B44-1"],"blankCount":1,"basis":"one atomic concept"},{"setId":"MI-03-CS-PF-02-B44C-2","unitIds":["MI-03-CS-PF-02-B44-2"],"blankCount":1,"basis":"one atomic concept"}],"practicalSets":[{"setId":"MI-03-CS-PF-02-B44P-1","unitIds":["MI-03-CS-PF-02-B44-1","MI-03-CS-PF-02-B44-2"],"blankCount":2,"basis":"two source-anchored concepts"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-04-CS-PF-04":{"version":"v9.0.44","units":[{"unitId":"MI-04-CS-PF-04-B44-1","text":"인공지능 시스템을 선택하여","start":0,"end":14,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"},{"unitId":"MI-04-CS-PF-04-B44-2","text":"문제 해결하기","start":15,"end":22,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"MI-04-CS-PF-04-B44C-1","unitIds":["MI-04-CS-PF-04-B44-1"],"blankCount":1,"basis":"one atomic concept"},{"setId":"MI-04-CS-PF-04-B44C-2","unitIds":["MI-04-CS-PF-04-B44-2"],"blankCount":1,"basis":"one atomic concept"}],"practicalSets":[{"setId":"MI-04-CS-PF-04-B44P-1","unitIds":["MI-04-CS-PF-04-B44-1","MI-04-CS-PF-04-B44-2"],"blankCount":2,"basis":"two source-anchored concepts"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-04-AC-EX-03":{"version":"v9.0.44","units":[{"unitId":"MI-04-AC-EX-03-B44-1","text":"법적, 사회적, 윤리적으로","start":65,"end":79,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"},{"unitId":"MI-04-AC-EX-03-B44-2","text":"해결 방안을 제시","start":89,"end":98,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"MI-04-AC-EX-03-B44C-1","unitIds":["MI-04-AC-EX-03-B44-1"],"blankCount":1,"basis":"one atomic concept"},{"setId":"MI-04-AC-EX-03-B44C-2","unitIds":["MI-04-AC-EX-03-B44-2"],"blankCount":1,"basis":"one atomic concept"}],"practicalSets":[{"setId":"MI-04-AC-EX-03-B44P-1","unitIds":["MI-04-AC-EX-03-B44-1","MI-04-AC-EX-03-B44-2"],"blankCount":2,"basis":"two source-anchored concepts"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-05-AC-ST-02":{"version":"v9.0.44","units":[{"unitId":"MI-05-AC-ST-02-B44-1","text":"민주적으로 논의하고","start":48,"end":58,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"},{"unitId":"MI-05-AC-ST-02-B44-2","text":"실천 방안을 수립","start":59,"end":68,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"MI-05-AC-ST-02-B44C-1","unitIds":["MI-05-AC-ST-02-B44-1"],"blankCount":1,"basis":"one atomic concept"},{"setId":"MI-05-AC-ST-02-B44C-2","unitIds":["MI-05-AC-ST-02-B44-2"],"blankCount":1,"basis":"one atomic concept"}],"practicalSets":[{"setId":"MI-05-AC-ST-02-B44P-1","unitIds":["MI-05-AC-ST-02-B44-1","MI-05-AC-ST-02-B44-2"],"blankCount":2,"basis":"two source-anchored concepts"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-02-CS-KI-02":{"version":"v9.0.44","units":[{"unitId":"HI-02-CS-KI-02-B44-1","text":"관계를 파악하여","start":11,"end":19,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"},{"unitId":"HI-02-CS-KI-02-B44-2","text":"구조화","start":20,"end":23,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"HI-02-CS-KI-02-B44C-1","unitIds":["HI-02-CS-KI-02-B44-1"],"blankCount":1,"basis":"one atomic concept"},{"setId":"HI-02-CS-KI-02-B44C-2","unitIds":["HI-02-CS-KI-02-B44-2"],"blankCount":1,"basis":"one atomic concept"}],"practicalSets":[{"setId":"HI-02-CS-KI-02-B44P-1","unitIds":["HI-02-CS-KI-02-B44-1","HI-02-CS-KI-02-B44-2"],"blankCount":2,"basis":"two source-anchored concepts"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-02-CS-PF-03":{"version":"v9.0.44","units":[{"unitId":"HI-02-CS-PF-03-B44-1","text":"빅데이터 기술","start":0,"end":7,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"},{"unitId":"HI-02-CS-PF-03-B44-2","text":"분석하고 시각화하기","start":19,"end":29,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"HI-02-CS-PF-03-B44C-1","unitIds":["HI-02-CS-PF-03-B44-1"],"blankCount":1,"basis":"one atomic concept"},{"setId":"HI-02-CS-PF-03-B44C-2","unitIds":["HI-02-CS-PF-03-B44-2"],"blankCount":1,"basis":"one atomic concept"}],"practicalSets":[{"setId":"HI-02-CS-PF-03-B44P-1","unitIds":["HI-02-CS-PF-03-B44-1","HI-02-CS-PF-03-B44-2"],"blankCount":2,"basis":"two source-anchored concepts"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-02-AC-EX-02":{"version":"v9.0.44","units":[{"unitId":"HI-02-AC-EX-02-B44-1","text":"암호화, 복호화","start":43,"end":51,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"},{"unitId":"HI-02-AC-EX-02-B44-2","text":"암호화의 중요성과 필요성","start":108,"end":121,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"HI-02-AC-EX-02-B44C-1","unitIds":["HI-02-AC-EX-02-B44-1"],"blankCount":1,"basis":"one atomic concept"},{"setId":"HI-02-AC-EX-02-B44C-2","unitIds":["HI-02-AC-EX-02-B44-2"],"blankCount":1,"basis":"one atomic concept"}],"practicalSets":[{"setId":"HI-02-AC-EX-02-B44P-1","unitIds":["HI-02-AC-EX-02-B44-1","HI-02-AC-EX-02-B44-2"],"blankCount":2,"basis":"two source-anchored concepts"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-03-CS-PF-04":{"version":"v9.0.44","units":[{"unitId":"HI-03-CS-PF-04-B44-1","text":"제어 구조","start":16,"end":21,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"},{"unitId":"HI-03-CS-PF-04-B44-2","text":"다차원 데이터 구조","start":23,"end":33,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B44_SOURCE_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"HI-03-CS-PF-04-B44C-1","unitIds":["HI-03-CS-PF-04-B44-1"],"blankCount":1,"basis":"one atomic concept"},{"setId":"HI-03-CS-PF-04-B44C-2","unitIds":["HI-03-CS-PF-04-B44-2"],"blankCount":1,"basis":"one atomic concept"}],"practicalSets":[{"setId":"HI-03-CS-PF-04-B44P-1","unitIds":["HI-03-CS-PF-04-B44-1","HI-03-CS-PF-04-B44-2"],"blankCount":2,"basis":"two source-anchored concepts"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true}};
for(const line of DATA.lines){if(CLOZE44_OVERRIDES[line.lineId])line.presentation=CLOZE44_OVERRIDES[line.lineId];}
const CLOZE45_OVERRIDES={"MI-03-AC-EX-01":{"version":"v9.0.45","units":[{"unitId":"MI-03-AC-EX-01-B45-1","text":"장단점","start":123,"end":126,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B45_MANUAL_LEARNING_VALUE"},{"unitId":"MI-03-AC-EX-01-B45-2","text":"비교⋅분석하여 논리적으로 설명","start":135,"end":151,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B45_MANUAL_LEARNING_VALUE"}],"coreSets":[{"setId":"MI-03-AC-EX-01-B45C-1","unitIds":["MI-03-AC-EX-01-B45-1"],"blankCount":1,"basis":"one semantic target"},{"setId":"MI-03-AC-EX-01-B45C-2","unitIds":["MI-03-AC-EX-01-B45-2"],"blankCount":1,"basis":"one semantic target"}],"practicalSets":[{"setId":"MI-03-AC-EX-01-B45P-1","unitIds":["MI-03-AC-EX-01-B45-1","MI-03-AC-EX-01-B45-2"],"blankCount":2,"basis":"selected nonoverlapping targets"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-03-AC-ST-09":{"version":"v9.0.45","units":[{"unitId":"HI-03-AC-ST-09-B45-1","text":"실생활 및 다양한 학문 분야","start":11,"end":26,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B45_MANUAL_LEARNING_VALUE"},{"unitId":"HI-03-AC-ST-09-B45-2","text":"협력적으로 설계⋅구현","start":44,"end":55,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B45_MANUAL_LEARNING_VALUE"}],"coreSets":[{"setId":"HI-03-AC-ST-09-B45C-1","unitIds":["HI-03-AC-ST-09-B45-1"],"blankCount":1,"basis":"one semantic target"},{"setId":"HI-03-AC-ST-09-B45C-2","unitIds":["HI-03-AC-ST-09-B45-2"],"blankCount":1,"basis":"one semantic target"}],"practicalSets":[{"setId":"HI-03-AC-ST-09-B45P-1","unitIds":["HI-03-AC-ST-09-B45-1","HI-03-AC-ST-09-B45-2"],"blankCount":2,"basis":"selected nonoverlapping targets"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-04-CS-PF-02":{"version":"v9.0.45","units":[{"unitId":"HI-04-CS-PF-02-B45-1","text":"기계학습","start":0,"end":4,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B45_MANUAL_LEARNING_VALUE"},{"unitId":"HI-04-CS-PF-02-B45-2","text":"문제의 유형","start":16,"end":22,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B45_MANUAL_LEARNING_VALUE"},{"unitId":"HI-04-CS-PF-02-B45-3","text":"비교하기","start":23,"end":27,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B45_MANUAL_LEARNING_VALUE"}],"coreSets":[{"setId":"HI-04-CS-PF-02-B45C-1","unitIds":["HI-04-CS-PF-02-B45-1"],"blankCount":1,"basis":"one semantic target"},{"setId":"HI-04-CS-PF-02-B45C-2","unitIds":["HI-04-CS-PF-02-B45-2"],"blankCount":1,"basis":"one semantic target"},{"setId":"HI-04-CS-PF-02-B45C-3","unitIds":["HI-04-CS-PF-02-B45-3"],"blankCount":1,"basis":"one semantic target"}],"practicalSets":[{"setId":"HI-04-CS-PF-02-B45P-1","unitIds":["HI-04-CS-PF-02-B45-1","HI-04-CS-PF-02-B45-2","HI-04-CS-PF-02-B45-3"],"blankCount":3,"basis":"selected nonoverlapping targets"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-04-AC-ST-03":{"version":"v9.0.45","units":[{"unitId":"MI-04-AC-ST-03-B45-1","text":"인공지능 시스템","start":24,"end":32,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B45_MANUAL_LEARNING_VALUE"},{"unitId":"MI-04-AC-ST-03-B45-2","text":"구성하고 적용","start":34,"end":41,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B45_MANUAL_LEARNING_VALUE"}],"coreSets":[{"setId":"MI-04-AC-ST-03-B45C-1","unitIds":["MI-04-AC-ST-03-B45-1"],"blankCount":1,"basis":"one semantic target"},{"setId":"MI-04-AC-ST-03-B45C-2","unitIds":["MI-04-AC-ST-03-B45-2"],"blankCount":1,"basis":"one semantic target"}],"practicalSets":[{"setId":"MI-04-AC-ST-03-B45P-1","unitIds":["MI-04-AC-ST-03-B45-1","MI-04-AC-ST-03-B45-2"],"blankCount":2,"basis":"selected nonoverlapping targets"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-04-CS-PF-04":{"version":"v9.0.45","units":[{"unitId":"MI-04-CS-PF-04-B45-1","text":"인공지능 시스템을 선택하여","start":0,"end":14,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B45_MANUAL_LEARNING_VALUE"}],"coreSets":[{"setId":"MI-04-CS-PF-04-B45C-1","unitIds":["MI-04-CS-PF-04-B45-1"],"blankCount":1,"basis":"one semantic target"}],"practicalSets":[{"setId":"MI-04-CS-PF-04-B45P-1","unitIds":["MI-04-CS-PF-04-B45-1"],"blankCount":1,"basis":"selected nonoverlapping targets"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true}};
for(const line of DATA.lines){if(CLOZE45_OVERRIDES[line.lineId])line.presentation=CLOZE45_OVERRIDES[line.lineId];}
const CLOZE46_OVERRIDES={"MI-03-CS-PF-02":{"version":"v9.0.46","units":[{"unitId":"MI-03-CS-PF-02-B46-1","text":"알고리즘을 설계","start":14,"end":22,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"},{"unitId":"MI-03-CS-PF-02-B46-2","text":"적용하기","start":25,"end":29,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"MI-03-CS-PF-02-B46C-1","unitIds":["MI-03-CS-PF-02-B46-1"],"blankCount":1,"basis":"atomic meaningful target"},{"setId":"MI-03-CS-PF-02-B46C-2","unitIds":["MI-03-CS-PF-02-B46-2"],"blankCount":1,"basis":"atomic meaningful target"}],"practicalSets":[{"setId":"MI-03-CS-PF-02-B46P-1","unitIds":["MI-03-CS-PF-02-B46-1","MI-03-CS-PF-02-B46-2"],"blankCount":2,"basis":"source anchored representative group"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-03-AC-ST-05":{"version":"v9.0.46","units":[{"unitId":"MI-03-AC-ST-05-B46-1","text":"순차적으로 저장할 수 있는 구조","start":15,"end":32,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"},{"unitId":"MI-03-AC-ST-05-B46-2","text":"프로그램을 작성","start":45,"end":53,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"MI-03-AC-ST-05-B46C-1","unitIds":["MI-03-AC-ST-05-B46-1"],"blankCount":1,"basis":"atomic meaningful target"},{"setId":"MI-03-AC-ST-05-B46C-2","unitIds":["MI-03-AC-ST-05-B46-2"],"blankCount":1,"basis":"atomic meaningful target"}],"practicalSets":[{"setId":"MI-03-AC-ST-05-B46P-1","unitIds":["MI-03-AC-ST-05-B46-1","MI-03-AC-ST-05-B46-2"],"blankCount":2,"basis":"source anchored representative group"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-04-AC-ST-02":{"version":"v9.0.46","units":[{"unitId":"MI-04-AC-ST-02-B46-1","text":"인공지능 학습","start":10,"end":17,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"},{"unitId":"MI-04-AC-ST-02-B46-2","text":"데이터를 수집하여 분류","start":44,"end":56,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"MI-04-AC-ST-02-B46C-1","unitIds":["MI-04-AC-ST-02-B46-1"],"blankCount":1,"basis":"atomic meaningful target"},{"setId":"MI-04-AC-ST-02-B46C-2","unitIds":["MI-04-AC-ST-02-B46-2"],"blankCount":1,"basis":"atomic meaningful target"}],"practicalSets":[{"setId":"MI-04-AC-ST-02-B46P-1","unitIds":["MI-04-AC-ST-02-B46-1","MI-04-AC-ST-02-B46-2"],"blankCount":2,"basis":"source anchored representative group"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-03-CS-KI-02":{"version":"v9.0.46","units":[{"unitId":"HI-03-CS-KI-02-B46-1","text":"데이터 간의 관계","start":26,"end":35,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"},{"unitId":"HI-03-CS-KI-02-B46-2","text":"분석하고, 정의","start":37,"end":45,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"HI-03-CS-KI-02-B46C-1","unitIds":["HI-03-CS-KI-02-B46-1"],"blankCount":1,"basis":"atomic meaningful target"},{"setId":"HI-03-CS-KI-02-B46C-2","unitIds":["HI-03-CS-KI-02-B46-2"],"blankCount":1,"basis":"atomic meaningful target"}],"practicalSets":[{"setId":"HI-03-CS-KI-02-B46P-1","unitIds":["HI-03-CS-KI-02-B46-1","HI-03-CS-KI-02-B46-2"],"blankCount":2,"basis":"source anchored representative group"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-03-AC-ST-03":{"version":"v9.0.46","units":[{"unitId":"HI-03-AC-ST-03-B46-1","text":"특징과 효율","start":31,"end":37,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"},{"unitId":"HI-03-AC-ST-03-B46-2","text":"비교⋅분석","start":39,"end":44,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"HI-03-AC-ST-03-B46C-1","unitIds":["HI-03-AC-ST-03-B46-1"],"blankCount":1,"basis":"atomic meaningful target"},{"setId":"HI-03-AC-ST-03-B46C-2","unitIds":["HI-03-AC-ST-03-B46-2"],"blankCount":1,"basis":"atomic meaningful target"}],"practicalSets":[{"setId":"HI-03-AC-ST-03-B46P-1","unitIds":["HI-03-AC-ST-03-B46-1","HI-03-AC-ST-03-B46-2"],"blankCount":2,"basis":"source anchored representative group"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-04-CS-KI-02":{"version":"v9.0.46","units":[{"unitId":"HI-04-CS-KI-02-B46-1","text":"문제 해결에 적합한 데이터","start":25,"end":39,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B51_MANUAL_LEARNING_VALUE"},{"unitId":"HI-04-CS-KI-02-B46-2","text":"기계학습 모델","start":41,"end":48,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"HI-04-CS-KI-02-B46C-1","unitIds":["HI-04-CS-KI-02-B46-1"],"blankCount":1,"basis":"atomic meaningful target"},{"setId":"HI-04-CS-KI-02-B46C-2","unitIds":["HI-04-CS-KI-02-B46-2"],"blankCount":1,"basis":"atomic meaningful target"}],"practicalSets":[{"setId":"HI-04-CS-KI-02-B46P-1","unitIds":["HI-04-CS-KI-02-B46-1","HI-04-CS-KI-02-B46-2"],"blankCount":2,"basis":"source anchored representative group"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-04-AC-EX-01":{"version":"v9.0.46","units":[{"unitId":"HI-04-AC-EX-01-B46-1","text":"인식, 학습, 추론, 행동","start":26,"end":40,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"},{"unitId":"HI-04-AC-EX-01-B46-2","text":"인간과 인공지능의 역할","start":75,"end":87,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"HI-04-AC-EX-01-B46C-1","unitIds":["HI-04-AC-EX-01-B46-1"],"blankCount":1,"basis":"atomic meaningful target"},{"setId":"HI-04-AC-EX-01-B46C-2","unitIds":["HI-04-AC-EX-01-B46-2"],"blankCount":1,"basis":"atomic meaningful target"}],"practicalSets":[{"setId":"HI-04-AC-EX-01-B46P-1","unitIds":["HI-04-AC-EX-01-B46-1","HI-04-AC-EX-01-B46-2"],"blankCount":2,"basis":"source anchored representative group"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-03-AC-ST-02":{"version":"v9.0.46","units":[{"unitId":"MI-03-AC-ST-02-B46-1","text":"추상화","start":20,"end":23,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"},{"unitId":"MI-03-AC-ST-02-B46-2","text":"핵심요소","start":36,"end":40,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"MI-03-AC-ST-02-B46C-1","unitIds":["MI-03-AC-ST-02-B46-1"],"blankCount":1,"basis":"atomic meaningful target"},{"setId":"MI-03-AC-ST-02-B46C-2","unitIds":["MI-03-AC-ST-02-B46-2"],"blankCount":1,"basis":"atomic meaningful target"}],"practicalSets":[{"setId":"MI-03-AC-ST-02-B46P-1","unitIds":["MI-03-AC-ST-02-B46-1","MI-03-AC-ST-02-B46-2"],"blankCount":2,"basis":"source anchored representative group"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-03-AC-ST-03":{"version":"v9.0.46","units":[{"unitId":"MI-03-AC-ST-03-B46-1","text":"다양한 알고리즘","start":36,"end":44,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B51_MANUAL_LEARNING_VALUE"},{"unitId":"MI-03-AC-ST-03-B46-2","text":"비교⋅분석","start":46,"end":51,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"MI-03-AC-ST-03-B46C-1","unitIds":["MI-03-AC-ST-03-B46-1"],"blankCount":1,"basis":"atomic meaningful target"},{"setId":"MI-03-AC-ST-03-B46C-2","unitIds":["MI-03-AC-ST-03-B46-2"],"blankCount":1,"basis":"atomic meaningful target"}],"practicalSets":[{"setId":"MI-03-AC-ST-03-B46P-1","unitIds":["MI-03-AC-ST-03-B46-1","MI-03-AC-ST-03-B46-2"],"blankCount":2,"basis":"source anchored representative group"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"HI-03-AC-ST-07":{"version":"v9.0.46","units":[{"unitId":"HI-03-AC-ST-07-B46-1","text":"제어 구조","start":15,"end":20,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"},{"unitId":"HI-03-AC-ST-07-B46-2","text":"복합적으로 활용","start":22,"end":30,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B46_MANUAL_SEMANTIC_REVIEW"}],"coreSets":[{"setId":"HI-03-AC-ST-07-B46C-1","unitIds":["HI-03-AC-ST-07-B46-1"],"blankCount":1,"basis":"atomic meaningful target"},{"setId":"HI-03-AC-ST-07-B46C-2","unitIds":["HI-03-AC-ST-07-B46-2"],"blankCount":1,"basis":"atomic meaningful target"}],"practicalSets":[{"setId":"HI-03-AC-ST-07-B46P-1","unitIds":["HI-03-AC-ST-07-B46-1","HI-03-AC-ST-07-B46-2"],"blankCount":2,"basis":"source anchored representative group"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true}};
for(const line of DATA.lines){if(CLOZE46_OVERRIDES[line.lineId])line.presentation=CLOZE46_OVERRIDES[line.lineId];}
const CLOZE52_OVERRIDES={"MI-03-CS-KI-01":{"version":"v9.0.52","units":[{"unitId":"MI-03-CS-KI-01-B52-1","text":"다양한 설계 전략","start":6,"end":15,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B52_SELECTED_LEARNING_VALUE"}],"coreSets":[{"setId":"MI-03-CS-KI-01-B52C-1","unitIds":["MI-03-CS-KI-01-B52-1"],"blankCount":1,"basis":"one source-anchored learning target"}],"practicalSets":[{"setId":"MI-03-CS-KI-01-B52P-1","unitIds":["MI-03-CS-KI-01-B52-1"],"blankCount":1,"basis":"independent source spans"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true},"MI-03-CS-KI-02":{"version":"v9.0.52","units":[{"unitId":"MI-03-CS-KI-02-B52-1","text":"자동화","start":0,"end":3,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B52_SELECTED_LEARNING_VALUE"},{"unitId":"MI-03-CS-KI-02-B52-2","text":"컴퓨터가 이해할 수 있는 언어","start":19,"end":35,"unitType":"phrase","sourceKeywordIds":[],"stage3RGrades":["B"],"directHistoricalEvidence":[],"sourceFaithful":true,"presentationBasis":"B52_SELECTED_LEARNING_VALUE"}],"coreSets":[{"setId":"MI-03-CS-KI-02-B52C-1","unitIds":["MI-03-CS-KI-02-B52-1"],"blankCount":1,"basis":"one source-anchored learning target"},{"setId":"MI-03-CS-KI-02-B52C-2","unitIds":["MI-03-CS-KI-02-B52-2"],"blankCount":1,"basis":"one source-anchored learning target"}],"practicalSets":[{"setId":"MI-03-CS-KI-02-B52P-1","unitIds":["MI-03-CS-KI-02-B52-1","MI-03-CS-KI-02-B52-2"],"blankCount":2,"basis":"independent source spans"}],"usesExpertOverride":true,"legacyKeywordsPreserved":true,"legacySetsPreserved":true}};
for(const line of DATA.lines){if(CLOZE52_OVERRIDES[line.lineId])line.presentation=CLOZE52_OVERRIDES[line.lineId];}
const $=id=>document.getElementById(id),state=CL.storage.load(),engine=CL.study.makeEngine(DATA,state);
// 누적 상태가 OFF였던 기존 사용자는 기존 카드 기록을 보존하면서 오답 카드를 항상 활성화한다.
state.ui.retry=true;CL.storage.restoreScopeRound(state);
const el={subject:$('subjectSelect'),area:$('areaSelect'),family:$('familySelect'),stage:$('stageSelect'),zoom:$('zoomSelect'),content:$('studyContent'),feedback:$('feedback'),meta:$('taskMeta'),progress:$('progressMeta'),retryReset:$('retryResetButton'),check:$('checkButton'),reveal:$('revealButton'),prev:$('prevButton'),next:$('nextButton'),round:$('nextRoundButton'),source:$('sourceButton'),dialog:$('sourceDialog'),dialogBody:$('sourceDialogBody'),closeSource:$('closeSource'),provenance:$('provenanceFooter'),studyPage:$('studyPage'),reviewPage:$('reviewPage'),studyTab:$('studyMainTab'),reviewTab:$('reviewMainTab'),retryDock:$('retryDock'),reviewSummary:$('reviewSummary'),reviewRetryCount:$('reviewRetryCount'),reviewWeakCount:$('reviewWeakCount'),reviewRetryList:$('reviewRetryList'),reviewWeakList:$('reviewWeakList'),clearAnswers:$('clearAnswersButton'),resetReview:$('resetReviewButton'),reviewTodayCount:$('reviewTodayCount'),dailyReviewList:$('dailyReviewList'),
areaMemoDock:$('areaMemoDock'),areaMemoShell:$('areaMemoShell'),areaMemoTab:$('areaMemoTab'),
areaMemoPanel:$('areaMemoPanel'),areaMemoTitle:$('areaMemoTitle'),areaMemoScope:$('areaMemoScope'),
areaMemoText:$('areaMemoText'),areaMemoSaveStatus:$('areaMemoSaveStatus'),
areaMemoClear:$('areaMemoClear'),areaMemoClose:$('areaMemoClose'),hardMode:$('hardModeButton'),hardModeState:$('hardModeState'),areaNav:$('areaNavigator'),prevArea:$('prevAreaButton'),nextArea:$('nextAreaButton'),currentArea:$('currentAreaLabel'),scrollTop:$('scrollTopButton'),scrollBottom:$('scrollBottomButton'),
controlCard:$('studyControlCard'),controlToggle:$('mobileControlToggle'),controlSummary:$('mobileControlSummary'),controlBody:$('studyControlBody'),
examPage:$('examPage'),examTab:$('examMainTab'),examCoverage:$('examCoverage'),examSummary:$('examSummary'),examYear:$('examYearSelect'),examPart:$('examPartSelect'),examSubject:$('examSubjectSelect'),examTopic:$('examTopicSelect'),examSolution:$('examSolutionSelect'),examSearch:$('examSearchInput'),examReset:$('examResetFilters'),examResultCount:$('examResultCount'),examList:$('examQuestionList'),examNavBar:$('examNavigationBar'),examQuestionSelect:$('examQuestionSelect'),examSheetButton:$('examAnswerSheetButton'),examSheetDialog:$('examAnswerSheetDialog'),examSheetYear:$('examSheetYear'),examSheetPart:$('examSheetPart'),examSheetContent:$('examSheetContent'),examSheetCount:$('examSheetCount'),examSheetClose:$('examAnswerSheetClose'),examDetail:$('examDetail')};
let pendingRetryAcknowledgment=null;
// 카드별 미확인 결과. 다른 카드를 열어도 채점 결과는 확인 전까지 유지한다.
const retryPendingById=new Map();
let revealed=false,activeRetryCardId='',areaMemoOpen=false,areaMemoSaveTimer=null,mobileControlsCollapsed=false,areaMemoMigrationChecked=false,practicalAdvanceTimer=null;
const PRACTICAL_AUTO_ADVANCE_DELAY_MS=950;
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

const EXAM_DATA=window.CURRILOOP_EXAM_DATA||{metadata:{coverage:{}},questions:[]};
const EXAM_UI_STORAGE_KEY='curriloop-exam-ui-v1';
let examUi=loadExamUi(),examRevealId='';
function loadExamUi(){
  const base={year:'all',part:'all',subject:'all',topic:'all',solution:'all',search:'',selectedId:''};
  try{return Object.assign(base,JSON.parse(localStorage.getItem(EXAM_UI_STORAGE_KEY)||'{}'));}catch(e){return base;}
}
function saveExamUi(){try{localStorage.setItem(EXAM_UI_STORAGE_KEY,JSON.stringify(examUi));}catch(e){}}

const AREA_MEMO_STORAGE_KEY='curriloop-area-notes-v1';

const LEGACY_AREA_MEMO_DEFAULTS={
  'middle-info':{
    '컴퓨팅 시스템':'컴퓨팅 시스템(구성요소·동작 원리) → 운영체제(기능) → 피지컬 컴퓨팅(개념·사례) → 필요성·가치 → 구성요소 선택 → 시스템 구상',
    '데이터':'디지털 데이터 표현 → 문제에 맞는 데이터 수집 → 목적에 맞게 구분·관리 → 표·다이어그램으로 구조화 → 데이터 관계 파악·의미 해석 → 수집·분석을 통한 융합 문제 해결',
    '알고리즘과 프로그래밍':'문제 상태 정의·구조화 → 추상화·핵심요소 → 알고리즘 표현·비교·분석·전략 선택 → 순차 데이터 저장 → 논리 연산·중첩 제어 → 함수·디버깅 → 실생활 문제 프로그래밍 → 협력 SW 개발',
    '인공지능':'인공지능(개념·특성·구별) → 데이터 중요성·수집·분류 → 인공지능 시스템 구성·적용 → 해결 가능한 문제 발견·적합 시스템 적용 → 데이터 윤리 문제 해결 방안',
    '디지털 문화':'디지털 사회 특성·직업 변화 → 생활 규칙의 민주적 논의·실천 → 개인 정보·권리·저작권 보호'
  },
  'high-info':{
    '컴퓨팅 시스템':'유·무선 네트워크 특성 → 네트워크 환경 구성 → 사물인터넷(구성·동작 원리) → 삶·사회 변화 예측 → 피지컬 장치 선택 → 사물인터넷 시스템 설계',
    '데이터':'데이터 압축(개념·필요성) → 압축 효율 분석·평가 → 암호화(개념·안전 관리 사례) → 빅데이터(개념·특징) → 문제에 맞는 데이터 수집 → 분석 도구·시각화 → 의미·가치 해석',
    '알고리즘과 프로그래밍':'문제 분해·모델링 → 정렬·탐색 알고리즘 효율 비교 → 자료형 선택 → 표준/파일 입출력 → 다차원 데이터 → 복합 제어 구조 → 클래스·인스턴스 → 협력 설계·구현 → 성능 평가·공유',
    '인공지능':'지능 에이전트(개념·특성) → 인간과 인공지능의 관계 → 기계학습(개념) → 지도학습·비지도학습 비교 → 적용 가능 문제 구분 → 사회문제에 기계학습 적용',
    '디지털 문화':'디지털 기술의 사회적 영향 분석·진로 설계 → 보호/공유 정보 구분 → 올바른 정보 보호 실천 → 정보보안 필요성·보안 기술 활용 → 디지털 윤리 실천'
  }
};
const AREA_MEMO_DEFAULTS={
  'middle-info':{
    '컴퓨팅 시스템':`1. 컴퓨팅 시스템
   - 구성요소
   - 동작 원리
2. 운영체제
   - 기능
3. 피지컬 컴퓨팅
   - 개념·사례
4. 피지컬 컴퓨팅 시스템
   - 필요성·가치
   - 구성요소 선택
   - 시스템 구상`,
    '데이터':`1. 디지털 데이터 표현
2. 데이터 수집
   - 문제에 맞는 데이터
3. 데이터 관리
   - 목적에 맞게 구분·관리
4. 데이터 구조화
   - 표·다이어그램
5. 데이터 해석
   - 데이터 관계 파악
   - 의미 해석
6. 융합 문제 해결
   - 수집·분석 활용`,
    '알고리즘과 프로그래밍':`1. 문제 상태 정의·구조화
2. 추상화
   - 핵심요소 추출
3. 알고리즘
   - 표현
   - 비교·분석
   - 전략 선택
4. 순차 데이터 저장
5. 논리 연산·중첩 제어
6. 함수·디버깅
7. 실생활 문제 프로그래밍
8. 협력 SW 개발`,
    '인공지능':`1. 인공지능
   - 개념·특성·구별
2. 데이터
   - 중요성
   - 수집·분류
3. 인공지능 시스템
   - 구성·적용
4. 문제 해결
   - 해결 가능한 문제 발견
   - 적합한 시스템 적용
5. 데이터 윤리
   - 문제와 해결 방안`,
    '디지털 문화':`1. 디지털 사회
   - 특성
   - 직업 변화
2. 디지털 생활 규칙
   - 민주적 논의·실천
3. 정보 권리 보호
   - 개인 정보
   - 권리
   - 저작권`
  },
  'high-info':{
    '컴퓨팅 시스템':`1. 유·무선 네트워크 특성
2. 네트워크 환경 구성
3. 사물인터넷
   - 구성·동작 원리
   - 삶·사회 변화 예측
4. 피지컬 장치 선택
5. 사물인터넷 시스템 설계`,
    '데이터':`1. 데이터 압축
   - 개념·필요성
   - 효율 분석·평가
2. 암호화
   - 개념
   - 안전 관리 사례
3. 빅데이터
   - 개념·특징
4. 데이터 수집
   - 문제에 맞는 데이터
5. 데이터 분석
   - 분석 도구
   - 시각화
6. 데이터 해석
   - 의미·가치`,
    '알고리즘과 프로그래밍':`1. 문제 분해·모델링
2. 정렬·탐색 알고리즘
   - 효율 비교
3. 자료형 선택
4. 입출력
   - 표준입출력
   - 파일입출력
5. 다차원 데이터
6. 복합 제어 구조
7. 클래스·인스턴스
8. 협력 설계·구현
9. 성능 평가·공유`,
    '인공지능':`1. 지능 에이전트
   - 개념·특성
2. 인간과 인공지능
   - 관계
3. 기계학습
   - 개념
   - 지도학습·비지도학습 비교
4. 문제 구분
   - 기계학습 적용 가능성
5. 사회문제 해결
   - 기계학습 적용`,
    '디지털 문화':`1. 디지털 기술과 사회
   - 사회적 영향 분석
   - 진로 설계
2. 정보 구분
   - 보호할 정보
   - 공유할 정보
3. 정보 보호 실천
4. 정보보안
   - 필요성
   - 보안 기술 활용
5. 디지털 윤리 실천`
  }
};
const AREA_MEMO_AREA_ORDER=['컴퓨팅 시스템','데이터','알고리즘과 프로그래밍','인공지능','디지털 문화'];
const AI_AREA_MEMO_ORDER=['인공지능의 이해','인공지능과 학습','인공지능의 사회적 영향','인공지능 프로젝트'];
AREA_MEMO_DEFAULTS['ai-basic']={
  '인공지능의 이해':'1. 인공지능의 원리\n2. 인공지능과 탐색\n3. 지식의 표현과 추론',
  '인공지능과 학습':'1. 기계학습과 데이터\n2. 기계학습 알고리즘\n3. 인공신경망과 딥러닝',
  '인공지능의 사회적 영향':'1. 인공지능의 발전과 사회 변화\n2. 인공지능과 진로\n3. 인공지능과 윤리',
  '인공지능 프로젝트':'1. 인공지능과 지속가능발전목표\n2. 인공지능 문제 해결 절차'
};
function areaMemoDefaultTextFor(subject,area,defaults=AREA_MEMO_DEFAULTS){
  const one=(s,a)=>defaults[s]?.[a]||'';
  if(subject==='all'&&area==='all'){
    const schoolBlock=(label,s)=>[`[${label}]`,...AREA_MEMO_AREA_ORDER.flatMap(x=>[`[${x}]`,one(s,x),''])].join('\n').trim();
    const aiBlock=['[인공지능 기초]',...AI_AREA_MEMO_ORDER.flatMap(x=>[`[${x}]`,one('ai-basic',x),''])].join('\n').trim();
    return `${schoolBlock('중학교 정보','middle-info')}\n\n${schoolBlock('고등학교 정보','high-info')}\n\n${aiBlock}`;
  }
  if(subject==='all'){
    const m=one('middle-info',area),h=one('high-info',area),ai=one('ai-basic',area);
    return [[m,'중학교'],[h,'고등학교'],[ai,'인공지능 기초']].filter(([v])=>v).map(([v,label])=>`[${label}]\n${v}`).join('\n\n');
  }
  if(area==='all'){
    return (subject==='ai-basic'?AI_AREA_MEMO_ORDER:AREA_MEMO_AREA_ORDER).flatMap(x=>[`[${x}]`,one(subject,x),'']).join('\n').trim();
  }
  return one(subject,area);
}
function areaMemoDefaultText(){return areaMemoDefaultTextFor(state.ui.subject||'middle-info',state.ui.area||'all');}
function legacyAreaMemoDefaultTextFor(subject,area){
  const one=(s,a)=>LEGACY_AREA_MEMO_DEFAULTS[s]?.[a]||'';
  if(subject==='all'&&area==='all'){
    return ['[중학교 정보]',...AREA_MEMO_AREA_ORDER.map(x=>`- ${x}: ${one('middle-info',x)}`),'','[고등학교 정보]',...AREA_MEMO_AREA_ORDER.map(x=>`- ${x}: ${one('high-info',x)}`)].join('\n');
  }
  if(subject==='all'){
    const m=one('middle-info',area),h=one('high-info',area);
    return [`[중학교] ${m}`,`[고등학교] ${h}`].filter(Boolean).join('\n\n');
  }
  if(area==='all')return AREA_MEMO_AREA_ORDER.map(x=>`- ${x}: ${one(subject,x)}`).join('\n');
  return one(subject,area);
}
function migrateAreaMemoDefaults(){
  if(areaMemoMigrationChecked)return;
  areaMemoMigrationChecked=true;
  const store=areaMemoStore();let changed=false;
  for(const subject of ['middle-info','high-info','all']){
    for(const area of ['all',...AREA_MEMO_AREA_ORDER]){
      const key=`${subject}|${area}`;
      if(!Object.prototype.hasOwnProperty.call(store,key))continue;
      const saved=String(store[key]??'');
      if(saved===legacyAreaMemoDefaultTextFor(subject,area)){
        store[key]=areaMemoDefaultTextFor(subject,area);
        changed=true;
      }
    }
  }
  if(changed)areaMemoSaveStore(store);
}
function areaMemoStore(){
  try{
    const raw=localStorage.getItem(AREA_MEMO_STORAGE_KEY);
    const parsed=raw?JSON.parse(raw):{};
    return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};
  }catch(_){return {};}
}
function areaMemoSaveStore(store){
  try{localStorage.setItem(AREA_MEMO_STORAGE_KEY,JSON.stringify(store||{}));}
  catch(e){console.warn('CurriLoop area memo save failed',e);}
}
function areaMemoKey(){return `${state.ui.subject||'middle-info'}|${state.ui.area||'all'}`;}
function areaMemoSubjectLabel(){
  if(state.ui.subject==='all')return '중·고 정보 전체';
  return engine.labels?.[state.ui.subject]||state.ui.subject||'정보';
}
function areaMemoAreaLabel(){return !state.ui.area||state.ui.area==='all'?'전체 영역':state.ui.area;}
function areaMemoScopeLabel(){return `${areaMemoSubjectLabel()} · ${areaMemoAreaLabel()}`;}
function updateAreaMemoLabels(){
  if(!el.areaMemoTitle)return;
  el.areaMemoTitle.textContent=`${areaMemoAreaLabel()} 메모`;
  el.areaMemoScope.textContent=areaMemoScopeLabel();
}
function loadAreaMemo(){
  if(!el.areaMemoText)return;
  migrateAreaMemoDefaults();
  const store=areaMemoStore(),key=areaMemoKey();
  const hasSaved=Object.prototype.hasOwnProperty.call(store,key);
  const value=hasSaved?String(store[key]??''):areaMemoDefaultText();
  if(!hasSaved){
    store[key]=value;
    areaMemoSaveStore(store);
  }
  el.areaMemoText.value=value;
  updateAreaMemoLabels();
  if(el.areaMemoSaveStatus)el.areaMemoSaveStatus.textContent='저장됨';
}
function saveAreaMemoNow(){
  if(!el.areaMemoText)return;
  if(areaMemoSaveTimer){clearTimeout(areaMemoSaveTimer);areaMemoSaveTimer=null;}
  const store=areaMemoStore(),key=areaMemoKey(),value=el.areaMemoText.value;
  // 빈 문자열도 사용자 의도일 수 있으므로 값 자체를 보존한다.
  store[key]=value;
  areaMemoSaveStore(store);
  if(el.areaMemoSaveStatus){
    el.areaMemoSaveStatus.textContent='저장됨';
    setTimeout(()=>{if(el.areaMemoSaveStatus)el.areaMemoSaveStatus.textContent='자동 저장';},900);
  }
}
function scheduleAreaMemoSave(){
  if(el.areaMemoSaveStatus)el.areaMemoSaveStatus.textContent='저장 중…';
  if(areaMemoSaveTimer)clearTimeout(areaMemoSaveTimer);
  areaMemoSaveTimer=setTimeout(saveAreaMemoNow,350);
}
function setAreaMemoOpen(open){
  areaMemoOpen=!!open;
  if(!el.areaMemoShell)return;
  el.areaMemoShell.classList.toggle('open',areaMemoOpen);
  el.areaMemoTab?.setAttribute('aria-expanded',areaMemoOpen?'true':'false');
  if(areaMemoOpen){
    loadAreaMemo();
    requestAnimationFrame(()=>{try{el.areaMemoText?.focus({preventScroll:true});}catch(_){el.areaMemoText?.focus();}});
  }else saveAreaMemoNow();
}
function clearCurrentAreaMemo(){
  const ok=window.confirm(`${areaMemoScopeLabel()} 메모를 기본 영역 개요로 초기화할까요?\n현재 작성한 메모는 덮어씁니다.`);
  if(!ok)return;
  const value=areaMemoDefaultText(),store=areaMemoStore();
  store[areaMemoKey()]=value;
  areaMemoSaveStore(store);
  if(el.areaMemoText){el.areaMemoText.value=value;el.areaMemoText.focus();}
  if(el.areaMemoSaveStatus)el.areaMemoSaveStatus.textContent='개요로 초기화됨';
  setTimeout(()=>{if(el.areaMemoSaveStatus)el.areaMemoSaveStatus.textContent='자동 저장';},1100);
}
const MOBILE_CONTROL_STORAGE_KEY='curriloop-mobile-controls-collapsed-v1';
const mobileControlMedia=window.matchMedia?window.matchMedia('(max-width:760px)'):null;
function currentSelectText(select){return select?.selectedOptions?.[0]?.textContent?.trim()||'';}
function mobileModeLabel(){
  const active=document.querySelector('[data-mode].active');
  return active?.textContent?.trim()||'';
}
function updateMobileControlSummary(){
  if(!el.controlSummary)return;
  const parts=[currentSelectText(el.subject),currentSelectText(el.area),currentSelectText(el.family),mobileModeLabel()].filter(Boolean);
  el.controlSummary.textContent=parts.join(' · ');
}
function applyMobileControlsCollapsed(collapsed,{save=false}={}){
  const mobile=mobileControlMedia?mobileControlMedia.matches:window.innerWidth<=760;
  mobileControlsCollapsed=mobile&&!!collapsed;
  if(el.controlCard)el.controlCard.classList.toggle('mobile-controls-collapsed',mobileControlsCollapsed);
  if(el.controlToggle){
    el.controlToggle.setAttribute('aria-expanded',mobileControlsCollapsed?'false':'true');
    el.controlToggle.setAttribute('aria-label',mobileControlsCollapsed?'학습 설정 펼치기':'학습 설정 접기');
  }
  if(save){try{localStorage.setItem(MOBILE_CONTROL_STORAGE_KEY,mobileControlsCollapsed?'1':'0');}catch(_){}}
}
function initMobileControlCollapse(){
  if(!el.controlToggle||!el.controlCard)return;
  let saved=false;
  try{saved=localStorage.getItem(MOBILE_CONTROL_STORAGE_KEY)==='1';}catch(_){}
  applyMobileControlsCollapsed(saved);
  updateMobileControlSummary();
  el.controlToggle.addEventListener('click',()=>{
    const next=!mobileControlsCollapsed;
    if(next&&el.controlBody?.contains(document.activeElement))el.controlToggle.focus();
    applyMobileControlsCollapsed(next,{save:true});
  });
  const onMediaChange=e=>applyMobileControlsCollapsed(e.matches?saved:false);
  if(mobileControlMedia?.addEventListener)mobileControlMedia.addEventListener('change',e=>{
    try{saved=localStorage.getItem(MOBILE_CONTROL_STORAGE_KEY)==='1';}catch(_){}
    onMediaChange(e);
  });
  else if(mobileControlMedia?.addListener)mobileControlMedia.addListener(onMediaChange);
}
function option(v,t){const o=document.createElement('option');o.value=v;o.textContent=t;return o;}
function setOptions(select,items,preferred){select.innerHTML='';items.forEach(([v,t])=>select.append(option(v,t)));select.value=items.some(x=>x[0]===preferred)?preferred:items[0]?.[0]||'';return select.value;}
function familyItems(){return engine.familyGroupOrder.filter(id=>engine.groupAvailable(id,el.subject.value,state.ui.area)).map(id=>[id,engine.groupLabel(id)]);}
function syncFamilies(preferred=state.ui.family){state.ui.family=setOptions(el.family,familyItems(),preferred);}
function syncStages(preferred=state.ui.stage){state.ui.stage=setOptions(el.stage,[['whole','전체 회상']], 'whole');}
function syncAreaOptions(preferred=state.ui.area){
  const subject=el.subject?.value||state.ui.subject||'middle-info';
  const areas=engine.areasForSubject(subject);
  el.area.innerHTML='';el.area.append(option('all','전체 영역'));
  if(subject==='all'){
    // Preserve a unique filter value for every subject/area pair.
    engine.subjects.forEach(sub=>engine.areasForSubject(sub).forEach(a=>
      el.area.append(option(`subject-area:${sub}:${a}`,`${engine.labels[sub]} - ${a}`))));
  }else areas.forEach(a=>el.area.append(option(a,a)));
  const value=[...el.area.options].some(o=>o.value===preferred)?preferred:(subject==='all'?'all':(areas[0]||'all'));
  el.area.value=value;state.ui.area=value;
}
function initSelectors(){
  el.subject.append(option('all','전체 과목'));engine.subjects.forEach(s=>el.subject.append(option(s,engine.labels[s])));
  el.subject.value=[...el.subject.options].some(o=>o.value===state.ui.subject)?state.ui.subject:'middle-info';
  syncAreaOptions(state.ui.area);
  syncFamilies();syncStages('whole');state.ui.stage='whole';if(el.stage)el.stage.value='whole';el.zoom.value=String(state.ui.zoom||100);applyZoom();
  document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.ui.mode));
}
function applyZoom(){const z=Number(el.zoom.value||100);state.ui.zoom=z;document.documentElement.style.setProperty('--ui-zoom',String(z/100));}

function familyGroupForLine(line){
  if(!line)return 'content-system';
  if(['핵심 아이디어','지식·이해','과정·기능','가치·태도'].includes(line.family))return 'content-system';
  if(line.family==='성취기준')return 'standards';
  if(['해설','고려사항'].includes(line.family))return 'explain-consider';
  if(['성격','목표'].includes(line.family))return 'character-goals';
  if(['교수·학습','평가'].includes(line.family))return 'teaching-eval';
  return 'content-system';
}
function taskContainsLine(task,lineId){
  if(!task||!lineId)return false;
  if(task.type==='line')return task.line?.lineId===lineId;
  return !!task.group?.items?.some(x=>x.lineId===lineId);
}

function retryEntries({dueOnly=false}={}){
  const serial=Number(state.answerSerial||0);
  return Object.entries(state.fieldRetries||{})
    .filter(([,r])=>r&&(!dueOnly||Number(r.dueAt)<=serial))
    // 오답 카드: 이전 오답부터 위에 두고 신규 오답은 항상 맨 아래에 추가한다.
    // 시간 값이 같으면 기존 저장 순서(Object.entries)를 유지한다(안정 정렬).
    .sort((a,b)=>Number(a[1].lastWrongSerial??-1)-Number(b[1].lastWrongSerial??-1));
}
function retryAnswerList(r){
  if(r?.kind==='process-bundle')return processBundleItems(r).flatMap(item=>item.units.map(u=>u.text));
  if(r?.kind==='set'&&Array.isArray(r.setAnswers))return r.setAnswers.map(x=>String(x||'').trim()).filter(Boolean);
  return [String(r?.correctAnswer||'').trim()].filter(Boolean);
}
function retrySafeLabel(text,answers,fallback='해당 항목'){
  const value=String(text||'').trim();
  if(!value)return fallback;
  const norm=CL.grading?.norm||((x)=>String(x||'').replace(/\s+/g,''));
  const vn=norm(value);
  const leaks=(answers||[]).some(ans=>{
    const an=norm(ans);
    return an&&vn.includes(an);
  });
  return leaks?fallback:value;
}
function retryOrigin(r){
  // 오답 생성 당시의 실제 과목·영역을 우선한다. 학습 필터의 '전체 영역'은 출처가 아니다.
  const scope=r.scope||{},taskId=String(r.taskId||'');
  const lineIds=[r.lineId,...(r.lineIds||[])].filter(Boolean);
  let line=lineIds.map(id=>engine.lineMap.get(id)).find(Boolean)||null;
  let group=null;
  if(!line&&taskId.startsWith('LINE:'))line=engine.lineMap.get(taskId.slice(5))||null;
  if(!line&&taskId.startsWith('KI:')){
    const gid=taskId.slice(3);
    group=(engine.data.knowledgeUnderstandingGroups||[]).find(g=>g.groupId===gid)||null;
  }
  // 구형 저장 기록에는 lineId가 없을 수 있으므로 taskId의 주제·영역도 복구한다.
  let taskSubject='',taskArea='';
  const matched=taskId.match(/^(?:CS|CST):([^:]+):([^:]+)(?::|$)/);
  if(matched){taskSubject=matched[1];taskArea=matched[2];}
  const whole=taskId.match(/^WG:[^:]+:([^:]+):(.+)$/);
  if(whole){taskSubject=whole[1];taskArea=whole[2];}
  const rawSubject=line?.subject||group?.subject||r.subject||taskSubject||(scope.subject!=='all'?scope.subject:'')||'';
  const rawArea=line?.area||group?.area||r.area||taskArea||(
    scope.area&&scope.area!=='all'?scope.area:''
  );
  const subject=engine.labels[rawSubject]||line?.subjectLabel||group?.subjectLabel||r.subjectLabel||
    (rawSubject&&rawSubject!=='all'?rawSubject:'과목 미확인');
  const area=rawArea&&rawArea!=='all'?rawArea:'영역 미확인';
  return {subject,area};
}
function retryMeta(r){
  const answers=retryAnswerList(r);
  const origin=retryOrigin(r);
  const subject=retrySafeLabel(origin.subject,answers,'해당 과목');
  const area=retrySafeLabel(origin.area,answers,'해당 영역');
  const section=retrySafeLabel(r.section||r.family||'빈칸',answers,'해당 구분');
  return `${subject} · ${area} · ${section}`;
}
function retryBlankText(text,answer,label='이 항목'){
  const source=String(text||'').trim(),target=String(answer||'').trim();
  const norm=CL.grading?.norm||((x)=>String(x||'').replace(/\s+/g,''));
  const safeLabel=retrySafeLabel(label,[target],'이 항목');
  if(!target)return `${safeLabel}의 정답을 다시 떠올려 입력하세요.`;
  if(!source||norm(source)===norm(target))return `${safeLabel} 전체를 다시 작성하세요.`;
  if(!source.includes(target))return `${safeLabel}의 정답을 다시 작성하세요.`;

  // 동일 정답이 원문에 여러 번 등장하면 전부 가려서 다른 위치에서 답이 노출되지 않게 한다.
  const masked=source.split(target).join('〔　　　　〕');
  // 띄어쓰기/기호만 다른 동일 표현이 남아 있으면 원문 자체를 보여주지 않는 쪽으로 안전하게 fallback.
  if(norm(target)&&norm(masked).includes(norm(target)))return `${safeLabel}의 핵심 표현을 다시 작성하세요.`;
  return masked;
}
function retrySourceLine(r){
  const ids=[r.lineId,...(r.lineIds||[])].filter(Boolean);
  const lines=ids.map(id=>engine.lineMap.get(id)).filter(Boolean);
  if(lines.length===1)return lines[0];
  if(lines.length>1&&lines.every(line=>line.family===lines[0].family))return lines[0];
  return null;
}
function retryCategoryLabel(r){
  // 재인출 저장 당시의 그룹명보다 실제 원문 문항 범주를 우선한다.
  // 예: 핵심 아이디어 문장이 '성취기준' 묶음에서 복습되더라도 코드가 있다고 오해하지 않는다.
  const source=retrySourceLine(r);
  const section=String(source?.family||r.section||r.family||'').replace(/\s+/g,'');
  if(section.includes('지식')&&section.includes('이해'))return '지식·이해';
  if(section.includes('과정')&&section.includes('기능'))return '과정·기능';
  if(section.includes('가치')&&section.includes('태도'))return '가치·태도';
  if(section.includes('성취기준'))return '성취기준';
  if(section.includes('핵심아이디어'))return '핵심 아이디어';
  // 묶음형 재인출은 주로 지식·이해 묶음이다. 나머지는 실제 저장된 범주를 표시한다.
  if(r.kind==='set'&&(r.taskId||'').startsWith('KI:'))return '지식·이해';
  return String(r.section||r.family||'다시 꺼내기');
}
function retryStandardCode(r){
  const line=retrySourceLine(r);
  // 공식 코드가 부여된 성취기준 문항에서만 번호를 출력한다.
  if(line){
    if(line.family!=='성취기준')return '';
    const text=String(line.sourceText||line.text||'');
    const match=text.match(/^\[([^\]]+)\]/)
      ||String(line.lineId||'').match(/((?:9정|12정|12인기|12데과)\d{2}-\d{2})/);
    return match?match[1]:'';
  }
  // 원본 lineId가 사라진 구형 기록도, 본문에 명시된 성취기준 코드만 복원.
  const match=String(r.contextText||'').match(/^\[([^\]]+)\]/);
  return match&&retryCategoryLabel(r)==='성취기준'?match[1]:'';
}
function sizeRetryInputs(panel){
  if(!panel)return;
  // Keep one-line fields: use the full panel width first, then shrink only long answers.
  const canvas=sizeRetryInputs.canvas||(sizeRetryInputs.canvas=document.createElement('canvas'));
  const ctx=canvas.getContext('2d');
  panel.querySelectorAll('input.retry-card-input').forEach(field=>{
    const text=field.value||field.placeholder||'';
    const computed=getComputedStyle(field);
    const baseFont=16;
    const available=Math.max(40,field.clientWidth-28);
    let size=baseFont;
    if(ctx&&text){
      ctx.font=`${computed.fontWeight||400} ${baseFont}px ${computed.fontFamily}`;
      const measured=ctx.measureText(text).width;
      if(measured>available)size=Math.max(10.5,Math.min(baseFont,baseFont*available/measured));
    }
    field.style.fontSize=`${size.toFixed(1)}px`;
  });
}
// 과정·기능 재인출은 해당 과목·영역에 있는 모든 원문 문장을 한 카드에 묶는다.
// 지식·이해와 달리 전체 문장을 입력하게 하지 않고 기존 일반모드 빈칸만 재사용한다.
function processBundleId(subject,area,round){
  return `PF-BUNDLE:${subject}:${area}|round:${round}`;
}
function processBundleItems(r){
  const lines=[...engine.lineMap.values()].filter(line=>line.family==='과정·기능'&&line.subject===r.subject&&line.area===r.area);
  return lines.map(line=>{
    const text=String(line.sourceText||'');
    const units=(engine.recallUnitsForLine(line,'whole')||[])
      .filter(u=>Number.isInteger(u.start)&&Number.isInteger(u.end)&&u.start>=0&&u.end<=text.length&&u.end>u.start&&text.slice(u.start,u.end)===u.text)
      .sort((a,b)=>a.start-b.start)
      .filter((u,i,arr)=>!i||u.start>=arr[i-1].end);
    return {lineId:line.lineId,text,units};
  });
}
function scheduleProcessBundle(line,status,oldRecord=null){
  if(!line||line.family!=='과정·기능')return;
  state.fieldRetries=state.fieldRetries||{};
  const round=Number(oldRecord?.round||state.round||1);
  const id=processBundleId(line.subject,line.area,round);
  const existing=state.fieldRetries[id]||oldRecord||{};
  const ctx=taskContext(currentTask());
  const serial=Number(state.answerSerial||0);
  state.fieldRetries[id]={...existing,kind:'process-bundle',section:'과정·기능',
    subject:line.subject,subjectLabel:line.subjectLabel||ctx.subject,area:line.area,
    lineIds:processBundleItems({subject:line.subject,area:line.area}).map(x=>x.lineId),
    taskId:engine.taskId(currentTask()),round,
    dueAt:Math.min(Number(existing.dueAt??Infinity),serial+Number(CL.config.retryDelay??0)),
    lastWrongSerial:Number(existing.lastWrongSerial??serial+1),status,
    scope:existing.scope||{subject:state.ui.subject,area:state.ui.area,family:state.ui.family,stage:state.ui.stage,mode:state.ui.mode}
  };
  // 동일 과목·영역의 예전 과정·기능 개별/통회상 카드와 중복 생성하지 않는다.
  for(const [oldId,old] of Object.entries(state.fieldRetries)){
    if(oldId===id||!old||old.section!=='과정·기능'||Number(old.round||1)!==round)continue;
    const origin=retryOrigin(old);
    const subject=engine.labels[line.subject]||line.subject;
    if(origin.subject===subject&&origin.area===line.area){
      state.fieldRetries[id].dueAt=Math.min(state.fieldRetries[id].dueAt,Number(old.dueAt||serial));
      delete state.fieldRetries[oldId];retryPendingById.delete(oldId);
      if(activeRetryCardId===oldId)activeRetryCardId=id;
    }
  }
}
function processBundleHtml(r){
  return `<div class="retry-process-lines">${processBundleItems(r).map((item,i)=>
    `<div class="retry-process-line"><span class="retry-process-number">${i+1}</span><div class="retry-process-text">${renderWithSpans(item.text,item.units,(u,j)=>
      `<input class="retry-card-input retry-process-input" data-retry-bundle-line="${i}" data-retry-bundle-unit="${j}" type="text" autocomplete="off" spellcheck="false" aria-label="과정·기능 ${i+1}번 문장 빈칸 ${j+1}" placeholder="빈칸">`
    )}</div></div>`).join('')}</div>`;
}
function retryCardPanelHtml(id,r){
  const bundleMode=r.kind==='process-bundle';
  const setMode=r.kind==='set'&&Array.isArray(r.setAnswers)&&r.setAnswers.length;
  const answers=retryAnswerList(r);
  const sectionLabel=retrySafeLabel(r.section||'내용 요소',answers,'해당 항목');
  const prompt=bundleMode?'같은 영역의 과정·기능 빈칸을 모두 채우세요.':setMode
    ? `${sectionLabel} 전체를 다시 쓰세요.`
    : retryBlankText(r.contextText||'',r.correctAnswer||'',`${sectionLabel} 항목`);
  const inputHtml=bundleMode?processBundleHtml(r):setMode
    ? `<div class="practical-retry-set">${r.setAnswers.map((_,i)=>`<input class="retry-card-input" data-retry-set-index="${i}" type="text" autocomplete="off" spellcheck="false" aria-label="재인출 답 ${i+1}" placeholder="${i+1}번">`).join('')}</div>`
    : `<input class="retry-card-input" type="text" autocomplete="off" spellcheck="false" aria-label="다시 꺼내기 답 입력" placeholder="정답을 다시 떠올려 입력">`;
  return `
    <div class="practical-retry-panel" data-retry-panel="${esc(id)}">
      <div class="retry-panel-top">
        <div class="practical-retry-kicker">${esc(retryCategoryLabel(r))}${retryStandardCode(r)?` <span class="retry-standard-code">${esc(retryStandardCode(r))}</span>`:''}</div>
        <span class="retry-result-badge" data-retry-result="${esc(id)}" aria-live="polite"></span>
      </div>
      <div class="practical-retry-prompt">${esc(prompt)}</div>
      <div class="practical-retry-row ${setMode||bundleMode?'set-mode':''}">
        ${inputHtml}
        <div class="practical-retry-actions">
          <span class="retry-action-note" data-retry-feedback="${esc(id)}" aria-live="polite" hidden></span>
          <button class="retry-card-grade primary" type="button" data-retry-grade="${esc(id)}">확인 <span class="retry-grade-shortcut">(Enter)</span></button>
          <button class="retry-card-later" type="button" data-retry-later="${esc(id)}">나중에</button>
        </div>
      </div>
    </div>`;
}
function retryDockVisibleEntries(due){
  // 카드 표시 수의 상한을 두지 않는다. 오래된 오답부터 신규 오답까지 모두 표시한다.
  return due;
}
function migrateLegacyProcessFunctionRetries(){
  // 기존 PF 개별 카드/통회상 카드를 같은 과목·영역의 원문 빈칸 묶음 카드로 변환.
  // 원본 지식·이해 오답 기록과 다른 범주는 그대로 보존한다.
  const retries=state.fieldRetries||{};
  let changed=false;
  for(const [id,r] of Object.entries({...retries})){
    if(!r||r.kind==='process-bundle')continue;
    const ids=[r.lineId,...(r.lineIds||[])].filter(Boolean);
    const line=ids.map(lineId=>engine.lineMap.get(lineId)).find(line=>line?.family==='과정·기능');
    // 구형 기록은 범주명이 '내용체계 + 성취기준'일 수 있으므로 원문 family로 판별한다.
    if(!line)continue; // 출처가 불명확한 구형 기록은 임의로 변환하지 않는다.
    scheduleProcessBundle(line,r.status||'wrong',r);
    if(retries[id]){delete retries[id];retryPendingById.delete(id);}
    changed=true;
  }
  if(changed)CL.storage.save(state);
}
function renderRetryDock(){
  migrateLegacyProcessFunctionRetries();
  if(!el.retryDock)return;
  const due=retryEntries({dueOnly:true});
  // Wrong answers create collapsed cards; opening the answer panel requires a click.
  if(!state.ui.retry||!due.length){
    el.retryDock.innerHTML='';
    el.retryDock.classList.remove('has-cards');
    activeRetryCardId='';
    pendingRetryAcknowledgment=null;
    if(!due.length)retryPendingById.clear();
    return;
  }
  const dueIds=new Set(due.map(([id])=>id));
  for(const id of retryPendingById.keys())if(!dueIds.has(id))retryPendingById.delete(id);
  if(activeRetryCardId&&!dueIds.has(activeRetryCardId))activeRetryCardId='';
  pendingRetryAcknowledgment=activeRetryCardId?(retryPendingById.get(activeRetryCardId)||null):null;
  const visible=retryDockVisibleEntries(due);
  el.retryDock.classList.add('has-cards');
  el.retryDock.innerHTML=visible.map(([id,r],i)=>{
    const expanded=activeRetryCardId===id;
    return `<section class="retry-card ${expanded?'expanded':''}" data-retry-id="${esc(id)}" style="--stack-i:${i}">
      <button class="retry-card-peek" type="button" data-retry-open="${esc(id)}" aria-expanded="${expanded}">
        <span class="retry-card-dot"></span>
        <span class="retry-card-body"><strong>다시 꺼내기</strong><small>${esc(retryMeta(r))}</small></span>
      </button>
      ${expanded?`<button class="retry-card-close retry-card-close-header" type="button" data-retry-collapse="${esc(id)}" aria-label="카드 접기">×</button>`:''}
      ${expanded?retryCardPanelHtml(id,r):''}
    </section>`;
  }).join('');
  if(activeRetryCardId){
    requestAnimationFrame(()=>{
      const panel=el.retryDock.querySelector(`[data-retry-panel="${CSS.escape(activeRetryCardId)}"]`);
      const pending=retryPendingById.get(activeRetryCardId);
      if(pending){
        restoreRetryAcknowledgment(activeRetryCardId,pending);
      }else{
        sizeRetryInputs(panel);
        const first=panel?.querySelector('.retry-card-input');
        if(first){try{first.focus({preventScroll:true});}catch(_){first.focus();}}
      }
    });
  }
}
function setRetryFeedback(id,mainText='',subText='',status=''){
  const note=el.retryDock?.querySelector(`[data-retry-feedback="${CSS.escape(id)}"]`);
  if(!note)return;
  // 성공·실패 여부는 카드 우측 상단 배지, 정답은 입력칸에서 확인한다.
  // 안내 문구는 확인 버튼과 같은 줄에 표시하고, 공간이 부족할 때만 줄바꿈한다.
  note.textContent=subText||mainText||'';
  note.hidden=!note.textContent;
  note.className='retry-action-note '+status;
}

function showRetryResult(id,status,text){
  const panel=el.retryDock?.querySelector(`[data-retry-panel="${CSS.escape(id)}"]`);
  const badge=panel?.querySelector(`[data-retry-result="${CSS.escape(id)}"]`);
  if(!panel||!badge)return;
  panel.classList.remove('result-good','result-near','result-bad');
  const cls=status==='correct'?'result-good':status==='near'?'result-near':'result-bad';
  panel.classList.add(cls);
  badge.textContent=text;
  badge.className=`retry-result-badge show ${cls}`;
}
function clearRetryResult(id){
  const panel=el.retryDock?.querySelector(`[data-retry-panel="${CSS.escape(id)}"]`);
  const badge=panel?.querySelector(`[data-retry-result="${CSS.escape(id)}"]`);
  if(panel)panel.classList.remove('result-good','result-near','result-bad');
  if(badge){badge.textContent='';badge.className='retry-result-badge';}
}
function collapseRetryCard(id=''){
  // 접기 또는 바깥 클릭은 채점 '확인'이 아니다. 미확인 결과를 보존한다.
  if(id&&activeRetryCardId!==id)return;
  const focused=document.activeElement;
  if(focused&&el.retryDock?.contains(focused)&&typeof focused.blur==='function')focused.blur();
  activeRetryCardId='';
  pendingRetryAcknowledgment=null;
  renderRetryDock();
}
function deferRetryCard(id){
  if(retryPendingById.has(id))return;
  const r=state.fieldRetries?.[id];if(!r)return;
  r.dueAt=Number(state.answerSerial||0)+Number(CL.config.retryDelay??0);
  activeRetryCardId='';
  persist();
  renderRetryDock();
  renderReviewPage();
}
function completeRetryRecord(id,r){
  if(r.kind==='process-bundle'){
    processBundleItems(r).filter(item=>item.units.length).forEach(item=>CL.storage.recordItem(state,item.lineId,'correct'));
    delete state.fieldRetries[id];
    return;
  }
  if(r.kind==='set'){
    if(r.sourceMode==='single-multiline'&&(r.sourceFieldKeys||[])[0]){
      const key=r.sourceFieldKeys[0],expected=(r.setAnswers||[]).join('\n');
      CL.storage.setDraft(state,key,expected);
      CL.storage.setFieldGrade(state,key,{status:'correct',reason:'retry',expected:(r.setAnswers||[]).join(' / ')});
    }else{
      (r.sourceFieldKeys||[]).forEach((key,i)=>{
        const expected=(r.setAnswers||[])[i]||'';
        if(key){
          CL.storage.setDraft(state,key,expected);
          CL.storage.setFieldGrade(state,key,{status:'correct',reason:'retry',expected});
        }
      });
    }
    (r.lineIds||[]).forEach(lineId=>CL.storage.recordItem(state,lineId,'correct'));
  }else{
    if(r.fieldKey){
      CL.storage.setDraft(state,r.fieldKey,r.correctAnswer||'');
      CL.storage.setFieldGrade(state,r.fieldKey,{status:'correct',reason:'retry',expected:r.correctAnswer||''});
    }
    if(r.lineId&&!r.recognitionCue)CL.storage.recordItem(state,r.lineId,'correct');
  }
  delete state.fieldRetries[id];
}
function rescheduleRetryRecord(id,r,status){
  r.status=status;
  r.retryAttempts=Number(r.retryAttempts||0)+1;
  // 틀린 카드는 횟수 제한으로 삭제하지 않는다. 다시 풀 때까지 오답 카드에 남긴다.
  // lastWrongSerial은 새 오답 카드와 동일한 정렬 기준이다. 기존 카드의 최댓값보다
  // 크게 갱신하여 답안 확인 뒤 목록의 맨 아래로 이동하게 한다.
  const currentMax=Math.max(Number(state.answerSerial||0),0,...Object.values(state.fieldRetries||{})
    .map(rec=>Number(rec?.lastWrongSerial||0)).filter(Number.isFinite));
  r.lastWrongSerial=currentMax+1;
  // 다음 오답을 풀 때에도 이 카드를 표시한다. 기존 지연 재인출 기록은 유지한다.
  r.dueAt=Number(state.answerSerial||0);
  return true;
}

function retryCardOrderSnapshot(){
  return retryEntries({dueOnly:true}).map(([id])=>id);
}
function nextRetryCardIdAfter(currentId,orderBefore){
  const dueNow=new Set(retryEntries({dueOnly:true}).map(([id])=>id));
  if(!dueNow.size)return '';
  const order=Array.isArray(orderBefore)&&orderBefore.length?orderBefore:[...dueNow];
  const start=order.indexOf(currentId);
  const i=start>=0?start:0;
  for(let step=1;step<=order.length;step++){
    const candidate=order[(i+step)%order.length];
    if(candidate&&candidate!==currentId&&dueNow.has(candidate))return candidate;
  }
  return '';
}
function acknowledgeRetryCard(id){
  const pending=pendingRetryAcknowledgment;
  if(!pending||pending.id!==id)return;
  if(pending.status==='correct'){
    const record=state.fieldRetries?.[id];
    if(record)completeRetryRecord(id,record);
  }else if(pending.removeOnAck){
    delete state.fieldRetries[id];
  }else{
    const record=state.fieldRetries?.[id];
    if(record)rescheduleRetryRecord(id,record,pending.status);
  }
  retryPendingById.delete(id);
  pendingRetryAcknowledgment=null;
  activeRetryCardId=nextRetryCardIdAfter(id,pending.orderBefore)||'';
  CL.storage.save(state);
  renderRetryDock();
  renderReviewPage();
}
function showRetryAcknowledgment(id,orderBefore,removeOnAck=false,status='wrong'){
  const panel=el.retryDock?.querySelector(`[data-retry-panel="${CSS.escape(id)}"]`);
  if(!panel)return;
  const badge=panel.querySelector('[data-retry-result]');
  const feedback=panel.querySelector('[data-retry-feedback]');
  const snapshot={
    fields:[...panel.querySelectorAll('.retry-card-input')].map(x=>({value:x.value,className:x.className})),
    resultStatus:badge?.classList.contains('result-good')?'correct':badge?.classList.contains('result-near')?'near':'wrong',
    resultText:badge?.textContent||'',
    feedbackText:feedback?.textContent||'',
    feedbackStatus:feedback?.classList.contains('good')?'good':feedback?.classList.contains('near')?'near':'bad'
  };
  pendingRetryAcknowledgment={id,orderBefore,removeOnAck,status,snapshot};
  retryPendingById.set(id,pendingRetryAcknowledgment);
  panel.querySelectorAll('.retry-card-input').forEach(control=>{control.disabled=true;});
  panel.querySelectorAll('[data-retry-later]').forEach(control=>{control.disabled=true;});
  const button=panel.querySelector('[data-retry-grade]');
  if(button){
    button.innerHTML='확인 <span class="retry-grade-shortcut">(Enter)</span>';
    button.disabled=false;
    button.dataset.retryAcknowledge=id;
    try{button.focus({preventScroll:true});}catch(_){button.focus();}
  }
  // 채점 결과는 확인 버튼 또는 Enter를 누르기 전까지 무기한 유지한다.
}
function restoreRetryAcknowledgment(id,pending){
  const panel=el.retryDock?.querySelector(`[data-retry-panel="${CSS.escape(id)}"]`);
  if(!panel)return;
  const snapshot=pending.snapshot||{};
  const fields=[...panel.querySelectorAll('.retry-card-input')];
  fields.forEach((input,i)=>{
    const previous=snapshot.fields?.[i];
    if(previous){input.value=previous.value;input.className=previous.className;}
    input.disabled=true;
  });
  panel.dataset.gradingLock='1';
  panel.classList.add('grading-lock');
  showRetryResult(id,snapshot.resultStatus||pending.status,snapshot.resultText||'');
  setRetryFeedback(id,'',snapshot.feedbackText||'',snapshot.feedbackStatus||'bad');
  panel.querySelectorAll('[data-retry-later]').forEach(control=>{control.disabled=true;});
  const button=panel.querySelector('[data-retry-grade]');
  if(button){
    button.innerHTML='확인 <span class="retry-grade-shortcut">(Enter)</span>';
    button.disabled=false;
    button.dataset.retryAcknowledge=id;
    try{button.focus({preventScroll:true});}catch(_){button.focus();}
  }
  sizeRetryInputs(panel);
}
function gradeRetryCard(id){
  if(pendingRetryAcknowledgment){if(pendingRetryAcknowledgment.id===id)acknowledgeRetryCard(id);return;}
  const r=state.fieldRetries?.[id];if(!r)return;
  const panel=el.retryDock?.querySelector(`[data-retry-panel="${CSS.escape(id)}"]`);
  if(!panel||panel.dataset.gradingLock==='1')return;
  panel.dataset.gradingLock='1';
  panel.classList.add('grading-lock');
  // 답안 입력만 잠그고 확인 버튼은 결과 표시 뒤 다시 활성화한다.
  panel.querySelectorAll('.retry-card-input').forEach(control=>{control.disabled=true;});
  const orderBefore=retryCardOrderSnapshot();
  const bundleMode=r.kind==='process-bundle';
  const setMode=r.kind==='set'&&Array.isArray(r.setAnswers)&&r.setAnswers.length;
  let status='wrong',expected='',hasWrong=false,hasUnknown=false,hasNear=false;

  if(bundleMode){
    const items=processBundleItems(r),details=[];
    items.forEach((item,i)=>item.units.forEach((unit,j)=>{
      const input=panel.querySelector(`[data-retry-bundle-line="${i}"][data-retry-bundle-unit="${j}"]`);
      if(!input)return;
      const detail=CL.grading.classifyDetailed(input.value,unit.text);
      details.push(detail.status);
      input.value=unit.text;
      const visual=detail.status==='duplicate'?'wrong':detail.status;
      ['correct','near','unknown','wrong'].forEach(c=>input.classList.remove(c));
      input.classList.add(visual);
      if(visual==='wrong')hasWrong=true;
      else if(visual==='unknown')hasUnknown=true;
      else if(visual==='near')hasNear=true;
    }));
    status=details.length?CL.grading.aggregateStatus(details):'wrong';
    expected=items.flatMap(item=>item.units.map(u=>u.text)).join(' / ');
  }else if(setMode){
    const fields=[...panel.querySelectorAll('.retry-card-input')],values=fields.map(x=>x.value);
    const grade=CL.grading.gradeSetDetailed(values,r.setAnswers);
    status=grade.status;
    // gradeSetDetailed는 미입력 답안의 expected에 첫 번째 미사용 정답을
    // 반복 지정할 수 있다. 정답 공개 시 이미 맞힌 항목을 예약하고,
    // 나머지 빈칸에는 서로 다른 나머지 정답을 하나씩 배정한다.
    // 채점 판정은 그대로 사용하고, 표시할 정답만 교정한다.
    const occupied=new Set(grade.results.filter(g=>
      (g.status==='correct'||g.status==='near')&&Number.isInteger(g.answerIndex)
    ).map(g=>g.answerIndex));
    const available=r.setAnswers.map((_,i)=>i).filter(i=>!occupied.has(i));
    grade.results.forEach((g,i)=>{
      const f=fields[i];if(!f)return;
      const matched=(g.status==='correct'||g.status==='near')&&Number.isInteger(g.answerIndex);
      const answerIndex=matched?g.answerIndex:available.shift();
      const canonical=r.setAnswers[answerIndex]||r.setAnswers[i]||'';
      if(canonical)f.value=canonical;
      const visual=g.status==='duplicate'?'wrong':g.status;
      ['correct','near','unknown','wrong'].forEach(c=>f.classList.remove(c));
      f.classList.add(visual);
      if(visual==='wrong')hasWrong=true;
      else if(visual==='unknown')hasUnknown=true;
      else if(visual==='near')hasNear=true;
    });
    expected=r.setAnswers.join(' / ');
  }else{
    const input=panel.querySelector('.retry-card-input');
    if(!input)return;
    const d=CL.grading.classifyDetailed(input.value,r.correctAnswer||'');
    status=d.status;
    expected=r.correctAnswer||d.expected||'';
    // 오답을 확인한 뒤 답안은 아래에 반복하지 않고, 붉은 입력칸 안에서 제시한다.
    if(expected)input.value=expected;
    const visual=status==='duplicate'?'wrong':status;
    ['correct','near','unknown','wrong'].forEach(c=>input.classList.remove(c));
    input.classList.add(visual);
    hasWrong=visual==='wrong';
    hasUnknown=visual==='unknown';
    hasNear=visual==='near';
  }

  sizeRetryInputs(panel); // 공식 정답으로 교체된 긴 글도 전체가 보이게 다시 측정

  if(status==='correct'){
    // 공식 표기로 교정된 입력과 정답 판정을 보여준 다음 완료 기록을 삭제한다.
    // 사용자가 확인/Enter를 누른 뒤에만 정답 카드를 제거한다.
    showRetryResult(id,'correct','재인출 성공');
    setRetryFeedback(id,'','확인하면 카드가 삭제됩니다.','good');
    showRetryAcknowledgment(id,orderBefore,false,'correct');
    return;
  }

  const overallNear=!hasWrong&&!hasUnknown&&(status==='near'||hasNear);
  showRetryResult(id,overallNear?'near':'wrong',overallNear?'표현 확인 필요':'재인출 실패');

  // 확인 전에는 오답 순서·시도 횟수를 바꾸지 않는다. 카드를 접고 다른 카드를 열 수 있다.
  setRetryFeedback(id,'','확인하면 카드가 맨 아래로 이동합니다.',overallNear?'near':hasUnknown&&!hasWrong?'unknown':'bad');
  showRetryAcknowledgment(id,orderBefore,false,'wrong');
}
function openRetryCard(id){
  const r=state.fieldRetries?.[id];if(!r)return;
  // 아직 due가 아니더라도 복습 탭에서 직접 열 수 있게 즉시 활성화한다.
  r.dueAt=Math.min(Number(r.dueAt||0),Number(state.answerSerial||0));
  activeRetryCardId=activeRetryCardId===id?'':id;
  pendingRetryAcknowledgment=activeRetryCardId?(retryPendingById.get(activeRetryCardId)||null):null;
  persist();
  renderRetryDock();
}

function reviewUnitsForLine(line){
  if(!line)return [];
  if(line.presentation?.units?.length)return line.presentation.units.slice().sort((x,y)=>x.start-y.start);
  return (line.keywords||[]).filter(k=>k.active).slice().sort((x,y)=>x.start-y.start);
}
function dailyReviewGroups(){
  const due=CL.storage.dueReviewItems(state),groups=[],kiMap=new Map();
  due.forEach(rec=>{
    const line=engine.lineMap.get(rec.lineId);if(!line)return;
    if(line.family==='지식·이해'){
      const key=`KI:${line.subject}:${line.area}`;
      if(!kiMap.has(key))kiMap.set(key,{id:key,kind:'ki',subject:line.subject,subjectLabel:line.subjectLabel,area:line.area,lineIds:[]});
      kiMap.get(key).lineIds.push(line.lineId);
      return;
    }
    const units=reviewUnitsForLine(line);
    if(!units.length)return;
    const unit=units[Number(rec.reviewCount||0)%units.length];
    groups.push({id:`LINE:${line.lineId}`,kind:'line',lineIds:[line.lineId],line,rec,answer:unit.text,prompt:retryBlankText(line.sourceText,unit.text,`${line.family||'이'} 항목`)});
  });
  kiMap.forEach(g=>{
    const kg=(engine.data.knowledgeUnderstandingGroups||[]).find(x=>x.subject===g.subject&&x.area===g.area);
    if(!kg)return;
    g.answers=kg.items.map(x=>x.text);g.allLineIds=kg.items.map(x=>x.lineId);groups.unshift(g);
  });
  return groups;
}
function dailyReviewCardHtml(g){
  if(g.kind==='ki'){
    return `<article class="daily-review-card" data-daily-review="${esc(g.id)}">
      <div class="daily-review-card-head"><div><strong>${esc(g.subjectLabel)} · ${esc(g.area)} · 지식·이해</strong><small>영역 전체 회상</small></div><span>${g.lineIds.length}개 예정</span></div>
      <div class="daily-review-prompt">이 영역의 지식·이해 내용 요소를 모두 입력하세요.</div>
      <div class="daily-review-inputs">${g.answers.map((_,i)=>`<input class="daily-review-input" data-daily-index="${i}" autocomplete="off" spellcheck="false" placeholder="${i+1}번">`).join('')}</div>
      <div class="daily-review-actions"><button type="button" class="primary" data-daily-grade="${esc(g.id)}">채점</button></div>
      <div class="daily-review-feedback"></div>
    </article>`;
  }
  return `<article class="daily-review-card" data-daily-review="${esc(g.id)}">
    <div class="daily-review-card-head"><div><strong>${esc(g.line.subjectLabel)} · ${esc(g.line.area)}</strong><small>${esc(g.line.family)}</small></div><span>${Number(g.rec.stage||0)+1}단계</span></div>
    <div class="daily-review-prompt">${esc(g.prompt)}</div>
    <div class="daily-review-inline"><input class="daily-review-input" autocomplete="off" spellcheck="false" placeholder="정답 입력"><button type="button" class="primary" data-daily-grade="${esc(g.id)}">채점</button></div>
    <div class="daily-review-feedback"></div>
  </article>`;
}
// 오늘의 복습: 채점 결과를 확인할 때까지 원래 카드를 유지한다.
// 통계/복습 일정은 실제 확인(Enter) 시 한 번만 갱신한다.
const pendingDailyReviewGrades=new Map();
function gradeDailyReview(id){
  if(pendingDailyReviewGrades.has(id)){acknowledgeDailyReview(id);return;}
  const group=dailyReviewGroups().find(g=>g.id===id);if(!group)return;
  const card=el.dailyReviewList?.querySelector(`[data-daily-review="${CSS.escape(id)}"]`);if(!card)return;
  let status='correct',expected='';
  if(group.kind==='ki'){
    const fields=[...card.querySelectorAll('.daily-review-input')],grade=CL.grading.gradeSetDetailed(fields.map(x=>x.value),group.answers);
    status=grade.status;expected=group.answers.join(' / ');
    // 채점 상태는 입력한 답으로 판정하되, 표시되는 입력값은 항상 공식 정답이다.
    // 지식·이해는 순서 무관 채점이므로 같은 정답을 여러 칸에 중복 표시하지 않는다.
    const displayResults=distinctExpectedResults(grade.results,group.answers);
    displayResults.forEach((r,i)=>{
      const f=fields[i];if(!f)return;
      f.value=r.expected||group.answers[i]||'';
      ['correct','near','unknown','wrong'].forEach(c=>f.classList.remove(c));
      f.classList.add(r.status==='duplicate'?'wrong':r.status);
    });
  }else{
    const f=card.querySelector('.daily-review-input'),d=CL.grading.classifyDetailed(f?.value||'',group.answer);
    status=d.status;expected=group.answer;
    if(f){
      // 오답·표기 확인도 원래 입력칸 안에서 공식 정답을 확인한다.
      if(expected)f.value=expected;
      ['correct','near','unknown','wrong'].forEach(c=>f.classList.remove(c));
      f.classList.add(status==='duplicate'?'wrong':status);
    }
  }
  const fb=card.querySelector('.daily-review-feedback'),label=status==='correct'?'정답':status==='near'?'표기 확인':status==='unknown'?'모름':'오답';
  if(fb){
    // 정답은 이미 각 입력칸에 표시된다. 아래에서 같은 정답을 재나열하지 않는다.
    fb.textContent=`${label} · 확인(Enter)을 누르면 다음 카드로 이동합니다.`;
    fb.className='daily-review-feedback '+statusClass(status);
  }
  pendingDailyReviewGrades.set(id,{lineIds:[...group.lineIds],status,feedbackText:fb?.textContent||'',values:[...card.querySelectorAll('.daily-review-input')].map(f=>f.value),visuals:[...card.querySelectorAll('.daily-review-input')].map(f=>['correct','near','unknown','wrong'].find(c=>f.classList.contains(c))||'')});
  card.dataset.dailyPending='1';
  // Enter로 채점한 바로 그 키 입력이 확인 버튼까지 작동시키지 않게
  // 입력칸의 포커스를 유지한다. 편집만 차단하여 결과는 보존한다.
  card.querySelectorAll('.daily-review-input').forEach(f=>{f.readOnly=true;});
  const button=card.querySelector('[data-daily-grade]');
  if(button){
    button.textContent='확인 (Enter)';
    button.dataset.dailyAcknowledge=id;
  }
}
function acknowledgeDailyReview(id){
  const pending=pendingDailyReviewGrades.get(id);
  if(!pending)return;
  // 사용자가 확인하기 전에는 복습 기록과 학습 일정이 변경되지 않는다.
  pendingDailyReviewGrades.delete(id);
  pending.lineIds.forEach(lineId=>{
    CL.storage.recordItem(state,lineId,pending.status);
    CL.storage.completeDailyReview(state,lineId,pending.status);
  });
  CL.storage.save(state);
  renderRetryDock();
  const container=el.dailyReviewList;
  // 다른 카드에 미리 적어 둔 답안을 전체 화면 갱신 중에도 보존한다.
  const drafts=new Map();
  container?.querySelectorAll('[data-daily-review]').forEach(card=>{
    const cardId=card.dataset.dailyReview;
    if(cardId===id)return;
    drafts.set(cardId,[...card.querySelectorAll('.daily-review-input')].map(f=>f.value));
  });
  const cardBefore=container?.querySelector(`[data-daily-review="${CSS.escape(id)}"]`);
  const cardsBefore=container?[...container.querySelectorAll('[data-daily-review]')]:[];
  const index=cardsBefore.indexOf(cardBefore);
  const nextId=(cardsBefore[index+1]||cardsBefore[0])?.dataset.dailyReview||'';
  renderReviewPage();
  drafts.forEach((values,cardId)=>{
    const card=container?.querySelector(`[data-daily-review="${CSS.escape(cardId)}"]`);
    if(!card)return;
    card.querySelectorAll('.daily-review-input').forEach((f,i)=>{
      if(values[i]!==undefined)f.value=values[i];
    });
  });
  const nextCard=nextId?container?.querySelector(`[data-daily-review="${CSS.escape(nextId)}"]`):null;
  const nextInput=(nextCard&&!pendingDailyReviewGrades.has(nextId)?nextCard.querySelector('.daily-review-input'):null)
    ||container?.querySelector('[data-daily-review]:not([data-daily-pending]) .daily-review-input');
  if(nextInput){
    requestAnimationFrame(()=>{
      if(!nextInput.isConnected)return;
      try{nextInput.focus({preventScroll:true});}catch(_){nextInput.focus();}
      nextInput.scrollIntoView({block:'nearest',behavior:'instant'});
    });
  }
}
function weakReviewItems(){
  return Object.entries(state.itemProgress||{})
    .map(([lineId,p])=>{
      const line=engine.lineMap.get(lineId);
      const failures=Number(p.wrong||0)+Number(p.unknown||0)+Number(p.near||0)+Number(p.duplicate||0);
      const score=Number(p.wrong||0)*4+Number(p.unknown||0)*3+Number(p.near||0)*1.5+Number(p.duplicate||0)*3-Number(p.correct||0)*.35;
      return {lineId,p,line,failures,score};
    })
    .filter(x=>x.line&&x.failures>0)
    .sort((a,b)=>b.score-a.score||b.failures-a.failures)
    .slice(0,24);
}
function renderReviewPage(){
  if(!el.reviewPage)return;
  const retries=retryEntries(),due=retryEntries({dueOnly:true}),weak=weakReviewItems(),daily=dailyReviewGroups(),serial=Number(state.answerSerial||0);
  if(el.reviewTodayCount)el.reviewTodayCount.textContent=String(daily.length);
  if(el.reviewRetryCount)el.reviewRetryCount.textContent=String(due.length);
  if(el.reviewWeakCount)el.reviewWeakCount.textContent=String(weak.length);
  if(el.dailyReviewList)el.dailyReviewList.innerHTML=daily.length?daily.map(dailyReviewCardHtml).join(''):`<div class="review-empty">오늘 예정된 장기 복습이 없습니다.</div>`;
  // 채점 결과가 확인 대기 중일 때 다른 화면 갱신이 발생해도 상태를 보존한다.
  pendingDailyReviewGrades.forEach((grade,cardId)=>{
    const card=el.dailyReviewList?.querySelector(`[data-daily-review="${CSS.escape(cardId)}"]`);
    if(!card)return;
    card.dataset.dailyPending='1';
    card.querySelectorAll('.daily-review-input').forEach((f,i)=>{
      f.value=grade.values[i]??'';
      if(grade.visuals[i])f.classList.add(grade.visuals[i]);
      f.readOnly=true;
    });
    const button=card.querySelector('[data-daily-grade]');
    if(button){button.textContent='확인 (Enter)';button.dataset.dailyAcknowledge=cardId;}
    const fb=card.querySelector('.daily-review-feedback');
    if(fb){fb.textContent=grade.feedbackText;fb.className='daily-review-feedback '+statusClass(grade.status);}
  });
  if(el.reviewSummary)el.reviewSummary.textContent=daily.length?`오늘의 복습 ${daily.length}개`:(due.length?`지금 다시 풀 수 있는 카드 ${due.length}개`:(retries.length?'재인출 대기 중':'오늘 복습 완료'));
  if(el.reviewRetryList){
    el.reviewRetryList.innerHTML=retries.length?retries.map(([id,r])=>{
      const left=Math.max(0,Number(r.dueAt)-serial),ready=left===0;
      return `<button class="review-row retry-review-row ${ready?'ready':''}" data-retry-id="${esc(id)}">
        <span><strong>${ready?'지금 복습':'재인출 대기'}</strong><small>${esc(retryMeta(r))}</small></span>
        <span class="review-row-badge">${ready?'열기':`${left}개 답 후`}</span>
      </button>`;
    }).join(''):`<div class="review-empty">현재 예약된 지연 재인출이 없습니다.</div>`;
  }
  if(el.reviewWeakList){
    el.reviewWeakList.innerHTML=weak.length?weak.map(x=>`
      <button class="review-row weak-review-row" data-line-id="${esc(x.lineId)}">
        <span><strong>${esc(x.line.area)} · ${esc(x.line.family)}</strong><small>${esc(x.line.sourceText.slice(0,92))}${x.line.sourceText.length>92?'…':''}</small></span>
        <span class="review-row-badge">${Number(x.p.wrong||0)+Number(x.p.unknown||0)}회</span>
      </button>`).join(''):`<div class="review-empty">아직 취약 항목 기록이 없습니다.</div>`;
  }
}
function examSortedQuestions(list){
  return [...list].sort((a,b)=>Number(b.year)-Number(a.year)||String(a.part).localeCompare(String(b.part))||Number(a.question)-Number(b.question));
}
function examBaseFilteredQuestions({ignoreTopic=false}={}){
  const query=String(examUi.search||'').trim().toLowerCase();
  return EXAM_DATA.questions.filter(q=>{
    if(examUi.year!=='all'&&String(q.year)!==String(examUi.year))return false;
    if(examUi.part!=='all'&&q.part!==examUi.part)return false;
    if(examUi.subject!=='all'&&q.subject!==examUi.subject)return false;
    if(!ignoreTopic&&examUi.topic!=='all'&&!(q.topics||[]).includes(examUi.topic))return false;
    if(examUi.solution!=='all'&&q.solutionStatus!==examUi.solution)return false;
    if(query){
      const hay=[q.year,q.part,q.question,q.subject,q.title,q.text,...(q.topics||[])].join(' ').toLowerCase();
      if(!hay.includes(query))return false;
    }
    return true;
  });
}
function examFilteredQuestions(){return examSortedQuestions(examBaseFilteredQuestions());}
function examOption(value,label,selected){return `<option value="${esc(value)}"${String(value)===String(selected)?' selected':''}>${esc(label)}</option>`;}
function syncExamTopicOptions(){
  if(!el.examTopic)return;
  const topics=[...new Set(examBaseFilteredQuestions({ignoreTopic:true}).flatMap(q=>q.topics||[]))].sort((a,b)=>a.localeCompare(b,'ko'));
  if(examUi.topic!=='all'&&!topics.includes(examUi.topic))examUi.topic='all';
  el.examTopic.innerHTML=examOption('all','전체 주제',examUi.topic)+topics.map(t=>examOption(t,t,examUi.topic)).join('');
}
function initExamBrowser(){
  if(!el.examPage)return;
  const years=[...new Set(EXAM_DATA.questions.map(q=>q.year))].sort((a,b)=>b-a);
  const presentSubjects=[...new Set(EXAM_DATA.questions.map(q=>q.subject))];
  const subjectOrder=EXAM_DATA.metadata?.subjectOrder||[];
  const subjects=[...subjectOrder.filter(x=>presentSubjects.includes(x)),...presentSubjects.filter(x=>!subjectOrder.includes(x)).sort((a,b)=>a.localeCompare(b,'ko'))];
  el.examYear.innerHTML=examOption('all','전체 연도',examUi.year)+years.map(y=>examOption(String(y),`${y}학년도`,examUi.year)).join('');
  el.examSubject.innerHTML=examOption('all','전체 과목',examUi.subject)+subjects.map(x=>examOption(x,x,examUi.subject)).join('');
  el.examPart.value=['A','B'].includes(examUi.part)?examUi.part:'all';
  el.examSolution.value=['solved','pending'].includes(examUi.solution)?examUi.solution:'all';
  el.examSearch.value=examUi.search||'';
  syncExamTopicOptions();
  const coverage=EXAM_DATA.metadata?.coverage||{};
  if(el.examCoverage){
    const missing=(coverage.missingYears||[]).length?` · 미수록 ${coverage.missingYears.join(', ')}학년도`:'';
    el.examCoverage.textContent=`${coverage.from||2014}–${coverage.to||2026}학년도 · ${coverage.questions||EXAM_DATA.questions.length}문항${missing} · 사용자 제공 전공 기출 PDF 기반`;
  }
}
function examQuestionButton(q){
  const selected=q.id===examUi.selectedId,solved=q.solutionStatus==='solved';
  const excerpt=String(q.title||q.text||'').replace(/\s+/g,' ').slice(0,116);
  const tags=(q.topics||[]).slice(0,3).map(t=>`<span>${esc(t)}</span>`).join('');
  return `<button class="exam-question-row${selected?' active':''}" type="button" data-exam-id="${esc(q.id)}">
    <div class="exam-question-row-top"><strong>${q.year} · 전공 ${esc(q.part)} · ${esc(q.questionLabel||`${q.question}번`)}</strong><span>${q.points?`${q.points}점`:'배점 미상'}</span></div>
    <div class="exam-question-row-subject">${esc(q.subject)}</div>
    <div class="exam-question-row-title">${esc(excerpt)}${excerpt.length>=116?'…':''}</div>
    <div class="exam-question-row-foot"><span class="exam-mini-tags">${tags}</span><em class="exam-solution-badge ${solved?'solved':'pending'}">${solved?'풀이 있음':'풀이 준비중'}</em></div>
  </button>`;
}
function examDetailHtml(q,list){
  if(!q)return `<div class="exam-no-result-layout"><div class="exam-side-navigation"></div><div class="exam-empty-detail"><strong>조건에 맞는 기출문제가 없습니다.</strong><span>필터나 검색어를 바꿔 보세요.</span></div></div>`;
  const idx=list.findIndex(x=>x.id===q.id),prev=idx>0?list[idx-1]:null,next=idx>=0&&idx<list.length-1?list[idx+1]:null;
  const solved=q.solutionStatus==='solved',unlocked=examRevealId===q.id;
  const answerNote=q.verification?.status==='derived'?'독립 풀이 · 공식 정답 검증 전':'기존 수록 풀이 · 공식 정답 대조 미확인';
  const solution=solved?`<aside class="exam-solution-panel${unlocked?' unlocked':''}" aria-label="정답과 풀이">
     <div class="exam-solution-panel-head"><strong>정답 및 풀이</strong><button type="button" class="exam-solution-hide" data-exam-hide ${unlocked?'':'hidden'}>다시 가리기</button></div>
     <div class="exam-solution-content" ${unlocked?'':'inert aria-hidden="true"'}>
       <p class="exam-answer-provenance">${esc(answerNote)}</p>
       <section class="exam-answer"><strong>정답</strong><p>${esc(q.answer)}</p></section>
       <section class="exam-explanation"><strong>풀이</strong><p>${esc(q.solution)}</p></section>
       ${window.CURRILOOP_THIRD_PASS_EXPLANATIONS?.[q.id]?`<section class="exam-explanation exam-third-pass"><strong>3차 검증 상세 풀이 (독립 초안)</strong><p>${esc(window.CURRILOOP_THIRD_PASS_EXPLANATIONS[q.id].explanation)}</p><p class="exam-answer-provenance">공식 채점기준 미대조 · 기존 정답/해설 보존</p></section>`:''}
     </div>
     <div class="exam-solution-overlay" ${unlocked?'hidden':''}><button class="exam-solution-unlock" type="button" data-exam-reveal aria-label="${q.year}학년도 전공 ${q.part} ${q.question}번 정답과 풀이 공개">정답·풀이 확인 <span aria-hidden="true">→</span></button></div>
     </aside>`:`<aside class="exam-solution-panel exam-unsolved" aria-label="풀이 미수록"><div class="exam-solution-panel-head"><strong>정답 및 풀이</strong></div><div class="exam-solution-pending"><strong>풀이 준비중</strong><p>이 문항의 독립 풀이가 아직 입력되지 않았습니다. 제공된 PDF에는 공식 정답이 없습니다.</p></div></aside>`;
  const imageList=(q.images||[]).map((img,i)=>{
    const originalHeight=Number(img.height)||1;
    const displayHeight=Math.min(originalHeight,Math.max(1,Number(window.CURRILOOP_EXAM_DISPLAY_BOUNDS?.[q.id]?.[i])||originalHeight));
    const label=`${q.year}학년도 전공 ${q.part} ${q.questionLabel||`${q.question}번`} 원문${(q.images||[]).length>1?` ${i+1}`:''}`;
    if(img.atlas){
      return `<figure class="exam-problem-image exam-atlas-crop"><svg viewBox="${Number(img.x)||0} ${Number(img.y)||0} ${Number(img.width)||1} ${displayHeight}" role="img" aria-label="${esc(label)}" preserveAspectRatio="xMinYMin meet"><image href="${esc(img.atlas)}" x="0" y="0" width="${Number(img.atlasWidth)||1}" height="${Number(img.atlasHeight)||1}" /></svg><figcaption>${(q.images||[]).length>1?`${i+1}/${q.images.length} · `:''}PDF ${img.page}쪽</figcaption></figure>`;
    }
    return `<figure class="exam-problem-image"><img src="${esc(img.src)}" alt="${esc(label)}" loading="lazy" decoding="async">${(q.images||[]).length>1?`<figcaption>${i+1}/${q.images.length} · PDF ${img.page}쪽</figcaption>`:''}</figure>`;
  }).join('');
  const problem=imageList?`<section class="exam-problem"><div class="exam-section-label">문제 원문</div><div class="exam-problem-images">${imageList}</div><details class="exam-text-fallback"><summary>검색용 추출 텍스트 보기</summary><div class="exam-problem-text">${esc(q.text)}</div></details></section>`:`<section class="exam-problem"><div class="exam-section-label">문제</div><div class="exam-problem-text">${esc(q.text)}</div></section>`;
  return `<div class="exam-detail-head">
      <h3 class="exam-selected-title">${q.year}학년도 · 전공 ${esc(q.part)} · ${q.question}번</h3>
      <div class="exam-detail-nav"><button type="button" data-exam-nav="${prev?esc(prev.id):''}" ${prev?'':'disabled'}>← 이전</button><button type="button" data-exam-nav="${next?esc(next.id):''}" ${next?'':'disabled'}>다음 →</button></div>
    </div>
    <div class="exam-two-pane">${problem}<div class="exam-right-column"><div class="exam-side-navigation"></div>${solution}</div></div>
    <footer class="exam-source-note">출처 · 한국교육과정평가원(KICE) · ${esc(q.year)}학년도 중등교사 임용시험 · 정보·컴퓨터 전공 ${esc(q.part)} · ${esc(q.questionLabel||`${q.question}번`)}${q.source?.pages?.length?` · 편집본 PDF ${q.source.pages.join(', ')}쪽`:''} · 사용자 제공 기출 편집본에서 발췌한 문제 화면</footer>`;
}
function renderExamPage(){
  if(!el.examPage)return;
  syncExamTopicOptions();
  const list=examFilteredQuestions();
  if(!list.some(q=>q.id===examUi.selectedId))examUi.selectedId=list[0]?.id||'';
  const selected=list.find(q=>q.id===examUi.selectedId)||null;
  const solved=list.filter(q=>q.solutionStatus==='solved').length;
  if(el.examResultCount)el.examResultCount.textContent=`${list.length}문항`;
  if(el.examSummary)el.examSummary.textContent=`현재 결과 ${list.length}문항 · 풀이 ${solved}문항`;
  if(el.examQuestionSelect){el.examQuestionSelect.innerHTML=list.length?list.map(q=>examOption(q.id,`${q.year}학년도 · 전공 ${q.part} · ${q.question}번`,examUi.selectedId)).join(''):'<option value="">조건에 맞는 문항 없음</option>';el.examQuestionSelect.disabled=!list.length;}
  if(el.examList)el.examList.innerHTML='';
  if(el.examDetail){
    el.examDetail.innerHTML=examDetailHtml(selected,list);
    // Keep the original filter controls and event listeners; move their single row
    // into the right-hand column, immediately above the answer/reveal panel.
    const sideSlot=el.examDetail.querySelector('.exam-side-navigation');
    if(sideSlot&&el.examNavBar)sideSlot.appendChild(el.examNavBar);
  }
  saveExamUi();
}
function setExamFilter(kind,value){
  examUi[kind]=value;examRevealId='';
  if(kind==='subject')examUi.topic='all';
  examUi.selectedId='';
  renderExamPage();
}
function selectExamQuestion(id,scrollDetail=false){
  if(!EXAM_DATA.questions.some(q=>q.id===id))return;
  if(examUi.selectedId!==id)examRevealId='';
  examUi.selectedId=id;renderExamPage();
  if(scrollDetail)requestAnimationFrame(()=>el.examDetail?.scrollIntoView({block:'start',behavior:'smooth'}));
}
function resetExamFilters(){
  examUi={year:'all',part:'all',subject:'all',topic:'all',solution:'all',search:'',selectedId:''};examRevealId='';
  initExamBrowser();renderExamPage();
}

function revealExamSolution(panel,reveal){
  if(!panel)return;
  const q=EXAM_DATA.questions.find(x=>x.id===examUi.selectedId);
  if(!q||q.solutionStatus!=='solved')return;
  examRevealId=reveal?q.id:'';
  panel.classList.toggle('unlocked',reveal);
  const content=panel.querySelector('.exam-solution-content');
  if(content){content.toggleAttribute('inert',!reveal);if(reveal)content.removeAttribute('aria-hidden');else content.setAttribute('aria-hidden','true');}
  const overlay=panel.querySelector('.exam-solution-overlay');
  if(overlay)overlay.hidden=reveal;
  const hide=panel.querySelector('[data-exam-hide]');
  if(hide)hide.hidden=!reveal;
  if(reveal){hide?.focus();}else{panel.querySelector('[data-exam-reveal]')?.focus();}
}
function openExamAnswerSheet(){
  const q=EXAM_DATA.questions.find(x=>x.id===examUi.selectedId)||EXAM_DATA.questions[0];
  if(!q||!el.examSheetDialog)return;
  const years=[...new Set(EXAM_DATA.questions.map(x=>x.year))].sort((a,b)=>b-a);
  el.examSheetYear.innerHTML=years.map(y=>examOption(String(y),`${y}학년도`,String(q.year))).join('');
  el.examSheetPart.value=q.part;
  renderExamAnswerSheet();
  if(!el.examSheetDialog.open)el.examSheetDialog.showModal();
}
function renderExamAnswerSheet(){
  if(!el.examSheetContent)return;
  const year=Number(el.examSheetYear.value),part=el.examSheetPart.value;
  const paper=EXAM_DATA.questions.filter(q=>q.year===year&&q.part===part).sort((a,b)=>a.question-b.question);
  const solved=paper.filter(q=>q.solutionStatus==='solved').length;
  el.examSheetCount.textContent=`${paper.length}문항 중 ${solved}문항 입력`;
  // Surface a stale/incomplete exam payload instead of silently labelling known answers as missing.
  const checkedIds=['2026-B-02','2026-B-03','2026-B-05'];
  const badIds=year===2026&&part==='B'?checkedIds.filter(id=>{const x=paper.find(q=>q.id===id);return !x||x.solutionStatus!=='solved'||!String(x.answer||'').trim();}):[];
  if(badIds.length)el.examSheetCount.textContent+=` · 데이터 불일치 감지: ${badIds.join(', ')} (새로고침 후 재확인)`;
  el.examSheetContent.innerHTML=paper.length?paper.map(q=>{
    const ready=q.solutionStatus==='solved';
    return `<div class="exam-sheet-row"><div class="exam-sheet-no"><strong>${q.question}번</strong><span>${esc(q.subject)} · ${q.points||'?'}점</span></div><div class="exam-sheet-answer ${ready?'':'is-pending'}">${ready?`<div class="exam-sheet-answer-text">${esc(q.answer)}</div>`:'<em>정답 미입력</em>'}</div></div>`;
  }).join(''):'<p>수록된 문제지가 없습니다.</p>';
}
function showMainTab(tab='study',save=true){
  const education=tab==='education',review=tab==='review',exam=tab==='exam',study=!review&&!exam&&!education;
  state.ui.mainTab=education?'education':exam?'exam':review?'review':'study';
  document.body.classList.toggle('exam-wide',exam);
  el.studyPage?.classList.toggle('hidden',!study);
  el.reviewPage?.classList.toggle('hidden',!review);
  el.examPage?.classList.toggle('hidden',!exam);
  const eduPage=document.getElementById('educationPage');
  eduPage?.classList.toggle('hidden',!education);
  if(eduPage)eduPage.hidden=!education;
  el.studyTab?.classList.toggle('active',study);
  el.reviewTab?.classList.toggle('active',review);
  el.examTab?.classList.toggle('active',exam);
  document.getElementById('educationMainTab')?.classList.toggle('active',education);
  el.studyTab?.setAttribute('aria-selected',String(study));
  el.reviewTab?.setAttribute('aria-selected',String(review));
  el.examTab?.setAttribute('aria-selected',String(exam));
  document.getElementById('educationMainTab')?.setAttribute('aria-selected',String(education));
  el.areaMemoDock?.classList.toggle('hidden',exam||education);
  el.retryDock?.classList.toggle('hidden',exam||education);
  if(review)renderReviewPage();
  if(exam)renderExamPage();else examRevealId='';
  if(save)persist();
}
function syncScopeControlsFromState(){
  el.subject.value=state.ui.subject;
  syncAreaOptions(state.ui.area);
  syncFamilies(state.ui.family);el.family.value=state.ui.family;
  syncStages('whole');state.ui.stage='whole';if(el.stage)el.stage.value='whole';
  document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.ui.mode));
}
function openWeakItem(lineId){
  const line=engine.lineMap.get(lineId);if(!line)return;
  persist();
  state.ui.subject=line.subject;
  state.ui.area=line.area==='과목 공통'?'all':line.area;
  state.ui.family=familyGroupForLine(line);
  state.ui.stage='whole';
  state.ui.mode='cloze';
  state.ui.mainTab='study';
  syncScopeControlsFromState();
  CL.storage.restoreScopeRound(state);
  engine.rebuild();
  const task=engine.queue.find(t=>taskContainsLine(t,lineId));
  if(task)engine.rebuild(engine.taskId(task));
  showMainTab('study',false);
  render();
  requestAnimationFrame(()=>{
    const field=answerFields().find(x=>x.dataset.lineId===lineId);
    if(field)focusAnswerField(field,true);
  });
}
function persist(){CL.storage.noteScopeRound(state);CL.storage.noteScopeTask(state,engine.current()?engine.taskId(engine.current()):'');CL.storage.save(state);renderRetryDock();if(state.ui.mainTab==='review')renderReviewPage();}
function rebuild(preferredId=''){const currentId=engine.current()?engine.taskId(engine.current()):'';const id=preferredId||CL.storage.scopeTask(state)||currentId;engine.rebuild(id);revealed=false;render();persist();}

function areaNavState(task=currentTask()){
  if(!task)return null;
  if(state.ui.area==='all'){
    const groups=[],seen=new Set();
    (engine.queue||[]).forEach((queued,index)=>{
      const c=taskContext(queued);
      if(!c||!c.area||c.area==='과목 공통')return;
      const key=`${c.subject}|${c.area}`;
      if(seen.has(key))return;
      seen.add(key);groups.push({key,subject:c.subject,area:c.area,index});
    });
    const c=taskContext(task),key=c&&c.area&&c.area!=='과목 공통'?`${c.subject}|${c.area}`:'',idx=groups.findIndex(x=>x.key===key);
    return idx>=0?{mode:'queue',groups,idx}:null;
  }
  if(String(state.ui.area).startsWith('subject-area:'))return null;
  const areas=(engine.areas||[]).filter(area=>engine.groupAvailable(state.ui.family,state.ui.subject,area));
  const idx=areas.indexOf(state.ui.area);
  const groups=areas.map(area=>({area}));
  return idx>=0?{mode:'filter',groups,idx}:null;
}
function renderAreaNavigator(task){
  const nav=areaNavState(task),show=!!(nav&&nav.groups.length>1);
  if(!el.areaNav)return;
  el.areaNav.hidden=!show;
  if(!show)return;
  const {groups,idx}=nav,g=groups[idx];
  el.currentArea.textContent=nav.mode==='queue'&&state.ui.subject==='all'?`${g.subject} · ${g.area}`:g.area;
  el.prevArea.disabled=idx<=0;el.nextArea.disabled=idx>=groups.length-1;
  el.prevArea.title=idx>0?`이전 영역: ${groups[idx-1].area}`:'첫 영역';
  el.nextArea.title=idx<groups.length-1?`다음 영역: ${groups[idx+1].area}`:'마지막 영역';
}
function cancelPracticalAutoAdvance(){
  if(practicalAdvanceTimer){clearTimeout(practicalAdvanceTimer);practicalAdvanceTimer=null;}
}
function currentAnswerFieldsAllCorrect(){
  const fields=answerFields();
  return !!fields.length&&fields.every(field=>{
    const key=field.dataset.fieldKey||'';
    const saved=key?CL.storage.getFieldGrade(state,key):null;
    return field.classList.contains('correct')||saved?.status==='correct';
  });
}
function schedulePracticalAutoAdvance(){
  const task=currentTask();
  if(!task||state.ui.stage!=='practical'||!['cloze','typing'].includes(state.ui.mode)||revealed||!currentAnswerFieldsAllCorrect())return false;
  cancelPracticalAutoAdvance();
  const taskId=engine.taskId(task),round=Number(state.round||1),st=engine.stats(),roundEnds=st.total>0&&st.cursor===st.total;
  el.feedback.textContent=roundEnds?'전체 정답 · 다음 회차로 넘어갑니다…':'전체 정답 · 다음 항목으로 넘어갑니다…';
  el.feedback.className='feedback good';
  practicalAdvanceTimer=setTimeout(()=>{
    practicalAdvanceTimer=null;
    const now=currentTask();
    if(!now||engine.taskId(now)!==taskId||Number(state.round||1)!==round||state.ui.stage!=='practical')return;
    engine.next();revealed=false;render();
    document.getElementById('studyCard')?.scrollIntoView({block:'start',behavior:'smooth'});
  },PRACTICAL_AUTO_ADVANCE_DELAY_MS);
  return true;
}
function jumpArea(delta){
  cancelPracticalAutoAdvance();
  const nav=areaNavState();if(!nav)return;
  const target=nav.groups[nav.idx+delta];if(!target)return;
  // 영역 이동 버튼을 누른 자리 그대로 유지한다. 기존 smooth scrollIntoView는
  // 영역별 내용 높이가 다를 때 화면을 위아래로 흔들었다.
  const beforeTop=el.areaNav?.getBoundingClientRect().top;
  const beforeY=window.scrollY;
  if(nav.mode==='queue'){
    engine.goTo(target.index);revealed=false;render();
  }else{
    changeScope(()=>{state.ui.area=target.area;el.area.value=target.area;});
  }
  if(Number.isFinite(beforeTop)&&el.areaNav&&!el.areaNav.hidden){
    const afterTop=el.areaNav.getBoundingClientRect().top;
    window.scrollBy({top:afterTop-beforeTop,behavior:'instant'});
  }else{
    window.scrollTo({top:beforeY,behavior:'instant'});
  }
}
function hardModeActive(){return !!state.ui.hardMode&&state.ui.mode==='cloze';}
function updateHardModeUI(){
  const on=!!state.ui.hardMode;
  if(el.hardMode){el.hardMode.setAttribute('aria-pressed',String(on));el.hardMode.classList.toggle('active',on);}
  if(el.hardModeState)el.hardModeState.textContent=on?'ON':'OFF';
}
function toggleHardMode(){
  cancelPracticalAutoAdvance();
  state.ui.hardMode=!state.ui.hardMode;
  if(state.ui.hardMode)state.ui.mode='cloze';
  document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.ui.mode));
  updateHardModeUI();updateMobileControlSummary();revealed=false;render();persist();
}
function setMode(m){cancelPracticalAutoAdvance();state.ui.mode=m;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));updateHardModeUI();updateMobileControlSummary();revealed=false;render();persist();}
function currentTask(){return engine.current();}
function isGroupTask(t){return t&&['content-system','content-standards','whole-group'].includes(t.type);}
function isKITask(t){return t&&t.type==='ki';}
function taskContext(task){
  if(task.type==='line')return {subject:task.line.subjectLabel,area:task.line.area,family:task.line.family,id:task.line.lineId};
  if(task.type==='ki')return {subject:task.group.subjectLabel,area:task.group.area,family:'지식·이해',id:task.group.groupId};
  return {subject:task.group.subjectLabel,area:task.group.area,family:task.group.label,id:task.group.groupId};
}
function render(){
  const task=currentTask(),st=engine.stats();el.feedback.textContent='';el.feedback.className='feedback';
  if(!task){el.content.innerHTML='<div class="empty">현재 조건에 해당하는 학습 항목이 없습니다.</div>';el.meta.textContent='';el.progress.textContent='';if(el.areaNav)el.areaNav.hidden=true;if(el.provenance)el.provenance.textContent='';return;}
  const c=taskContext(task);el.meta.textContent=`${c.subject} · ${c.area} · ${c.family}`;el.progress.textContent=`${st.cursor} / ${st.total}`;renderAreaNavigator(task);
  if(task.type==='content-system')renderContentSystem(task);
  else if(task.type==='content-standards')renderContentStandards(task);
  else if(task.type==='whole-group')renderWholeGroup(task.group);
  else if(task.type==='ki')renderKI(task.group);
  else renderLine(task.line);
  const mode=state.ui.mode;let gradable=mode==='cloze';
  if(task.type==='line'&&mode==='cloze'&&!hardModeActive()){const set=engine.selectedSet(task.line);gradable=!!(set&&engine.keywordsForSet(task.line,set).length);}
  if(task.type==='whole-group'&&task.group.subject==='data-science'&&task.group.familyGroup==='character-goals'&&mode==='cloze'&&!hardModeActive())gradable=false;
  el.check.disabled=!gradable;
  el.reveal.disabled=!gradable;
  el.check.hidden=!gradable;
  el.reveal.hidden=!gradable;
  renderProvenance(task);prepareAnswerFields();renderRetryDock();persist();
}
function hardClozeUnits(text){
  // 하드모드: 어절별 조각을 내지 않고 교육과정 내용 요소의 원문 전체를 빈칸 하나로 회상한다.
  // 성취기준 코드는 호출부에서 이미 분리하므로 빈칸에 포함되지 않는다.
  const source=String(text||'');
  return source.trim()? [{start:0,end:source.length,text:source,unitId:'hard-whole'}] : [];
}
function renderHardClozeText(text,lineId='',label='하드모드 빈칸'){
  const units=hardClozeUnits(text);
  return renderWithSpans(String(text||''),units,(u,i)=>`<input class="inline-input hard-inline-input hard-whole-input" data-line-id="${esc(lineId)}" data-answer="${esc(u.text)}" aria-label="${esc(label)} 전체" autocomplete="off">`);
}
function sourceItems(items,masked=false){return `<div class="source-list">${items.map((it,i)=>`<div class="item"><span class="num">${i+1}.</span> ${masked?`<span class="mask" data-reveal>${esc(it.text)}</span>`:esc(it.text)}</div>`).join('')}</div>`;}
function renderKI(g){
  const mode=state.ui.mode;if(mode==='source'){el.content.innerHTML=sourceItems(g.items,false);return;}if(mode==='mask'){el.content.innerHTML=sourceItems(g.items,true);bindMasks();return;}
  if(mode==='typing'){
    el.content.innerHTML=`<div class="typing-area trace-typing-area">
      <div class="trace-guide trace-guide-list">${g.items.map((it,i)=>`<span>${i+1}. ${esc(it.text)}</span>`).join('')}</div>
      <textarea id="typingInput" placeholder="내용 요소를 한 줄에 하나씩 입력"></textarea>
    </div>`;
    return;
  }
  el.content.innerHTML=`<div class="ki-grid">${g.items.map((_,i)=>`<label class="ki-row"><span>${i+1}</span><input class="ki-input" autocomplete="off" aria-label="${i+1}번 내용 요소"><span class="ki-mark"></span></label>`).join('')}</div>`;
}
const explanationFallbackPhrases={
  "MI-02-AC-CO-01": [
    "운영 체제",
    "파일 시스템",
    "전이"
  ],
  "MI-02-AC-CO-02": [
    "스프레드시트",
    "단계적으로"
  ],
  "MI-02-AC-CO-03": [
    "프로젝트 기반",
    "문제기반 학습"
  ],
  "MI-04-AC-CO-02": [
    "의견을 최대한 존중",
    "근거",
    "논리적으로"
  ],
  "MI-05-AC-CO-01": [
    "진로 연계 교육"
  ],
  "MI-05-AC-CO-02": [
    "민주시민 교육",
    "다른 사람의 의견을 존중"
  ],
  "HI-01-AC-CO-02": [
    "사물인터넷 장치",
    "유⋅무선 네트워크"
  ],
  "HI-02-AC-CO-03": [
    "데이터 압축",
    "암호화",
    "탄소중립"
  ],
  "HI-02-AC-CO-04": [
    "데이터에 기반하여",
    "토의⋅토론"
  ],
  "HI-03-AC-CO-02": [
    "대규모 데이터",
    "정렬하고 탐색"
  ],
  "HI-04-AC-CO-02": [
    "인공지능 플랫폼",
    "기계학습 라이브러리",
    "실생활의 문제 해결"
  ],
  "HI-04-AC-CO-03": [
    "지속가능발전목표",
    "사회 문제 해결"
  ],
  "HI-05-AC-CO-03": [
    "민주적인 방식",
    "규칙"
  ]
};
const curatedExplanationClozePhrases = {
  "MI-01-AC-EX-01": [
    "컴퓨팅 시스템",
    "운영 체제",
    "소프트웨어"
  ],
  "MI-01-AC-EX-02": [
    "고유한 역할",
    "물리적인 장치와 소프트웨어",
    "피지컬 컴퓨팅 시스템"
  ],
  "MI-01-AC-CO-01": [
    "구체적인 컴퓨팅 시스템의 예시",
    "사회에 주는 영향력",
    "구체적인 과제"
  ],
  "MI-01-AC-CO-02": [
    "초등학교 실과",
    "미리 구성되어 있는 피지컬 컴퓨팅 시스템",
    "하드웨어와 소프트웨어가 통합적으로 동작"
  ],
  "MI-01-AC-CO-03": [
    "탐구 중심의 활동",
    "프로젝트 형태의 수업"
  ],
  "MI-01-AC-CO-04": [
    "기초적인 프로그래밍 역량",
    "물리적인 도구"
  ],
  "MI-02-AC-EX-01": [
    "디지털 형태",
    "문자, 이미지, 소리, 동영상"
  ],
  "MI-02-AC-EX-02": [
    "수집하고 분류",
    "의미나 형식"
  ],
  "MI-02-AC-EX-03": [
    "분석하기 용이한 형태",
    "소프트웨어나 프로그래밍",
    "논리적으로 설명"
  ],
  "MI-02-AC-CO-01": [
    "실습 환경에 비교적 독립적인 소프트웨어",
    "여러 기기로 전이"
  ],
  "MI-02-AC-CO-02": [
    "스프레드시트",
    "데이터의 의미를 분석"
  ],
  "MI-02-AC-CO-03": [
    "프로젝트 기반의 문제 해결 활동",
    "문제기반 학습"
  ],
  "MI-03-AC-EX-01": [
    "알고리즘",
    "장단점",
    "비교⋅분석"
  ],
  "MI-03-AC-EX-02": [
    "문제 해결 전략",
    "적절한 전략"
  ],
  "MI-03-AC-EX-03": [
    "입력된 데이터를 처리",
    "배열이나 리스트"
  ],
  "MI-03-AC-CO-01": [
    "문제 발견",
    "상태 정의",
    "핵심요소 추출",
    "보고서나 포트폴리오"
  ],
  "MI-03-AC-CO-02": [
    "학생의 수준",
    "순차적으로 저장하는 구조",
    "중첩 제어 구조"
  ],
  "MI-03-AC-CO-03": [
    "실생활의 문제",
    "소프트웨어를 개발",
    "피지컬 컴퓨팅 시스템"
  ],
  "MI-03-AC-CO-04": [
    "시간, 에너지, 컴퓨팅 시스템 자원",
    "절약"
  ],
  "MI-04-AC-EX-01": [
    "모델, 학습, 데이터",
    "인공지능 시스템"
  ],
  "MI-04-AC-EX-02": [
    "이미지, 소리, 글자",
    "학습시키고",
    "문제를 해결"
  ],
  "MI-04-AC-EX-03": [
    "법적, 사회적, 윤리적으로",
    "장단점",
    "사회적 역할과 가치"
  ],
  "MI-04-AC-CO-01": [
    "익숙하게 활용할 수 있는 프로그래밍 언어",
    "인지적 부하"
  ],
  "MI-04-AC-CO-02": [
    "서로 다른 주장",
    "의견을 최대한 존중",
    "근거"
  ],
  "MI-04-AC-CO-03": [
    "여러 사례",
    "내면화"
  ],
  "MI-05-AC-EX-01": [
    "정보 윤리",
    "사이버 폭력 및 범죄 예방",
    "실천 방안"
  ],
  "MI-05-AC-CO-01": [
    "자신의 진로 계획",
    "진로 연계 교육"
  ],
  "MI-05-AC-CO-02": [
    "민주시민 교육",
    "다른 사람의 의견을 존중"
  ],
  "HI-01-AC-EX-01": [
    "네트워크",
    "구성요소",
    "유⋅무선 통신"
  ],
  "HI-01-AC-CO-01": [
    "학습자의 수준과 학습 환경",
    "교육과정을 재구성"
  ],
  "HI-01-AC-CO-02": [
    "개념적인 내용보다는",
    "사물인터넷 장치를 이해하고 구성"
  ],
  "HI-01-AC-CO-03": [
    "네트워크를 통한 데이터의 이동",
    "창의적인 아이디어",
    "누적한 후 평가"
  ],
  "HI-02-AC-EX-01": [
    "압축 원리",
    "품질 및 용량 분석",
    "효율성"
  ],
  "HI-02-AC-EX-02": [
    "치환형, 전치형",
    "암호화, 복호화",
    "중요성과 필요성"
  ],
  "HI-02-AC-CO-01": [
    "미리 작성된 코드",
    "출력되는 결과를 분석",
    "최소 성취수준"
  ],
  "HI-02-AC-CO-02": [
    "센서 데이터 수집",
    "공공 데이터나 민간 데이터",
    "프로젝트 방식"
  ],
  "HI-02-AC-CO-03": [
    "컴퓨팅 자원 절약",
    "탄소중립"
  ],
  "HI-02-AC-CO-04": [
    "다른 사람의 의견을 존중",
    "데이터에 기반하여",
    "토의⋅토론"
  ],
  "HI-03-AC-EX-01": [
    "작은 문제로 분해",
    "모델링",
    "오류가 없는지"
  ],
  "HI-03-AC-EX-02": [
    "정렬, 탐색 알고리즘",
    "수행 과정",
    "효율성"
  ],
  "HI-03-AC-EX-03": [
    "객체 지향",
    "클래스와 객체"
  ],
  "HI-03-AC-CO-01": [
    "문제 분해, 모델링, 알고리즘 설계",
    "프로그램 작성, 실행 결과 평가, 오류 수정",
    "나선형"
  ],
  "HI-03-AC-CO-02": [
    "대규모 데이터",
    "정렬하고 탐색"
  ],
  "HI-03-AC-CO-03": [
    "2차원 혹은 그 이상의 배열이나 리스트",
    "실제로 사용되는 데이터의 예시"
  ],
  "HI-03-AC-CO-04": [
    "미리 제작된 코드",
    "여러 라이브러리",
    "추가적인 교육 내용"
  ],
  "HI-04-AC-EX-01": [
    "에이전트와 지능 에이전트",
    "인식, 학습, 추론, 행동"
  ],
  "HI-04-AC-EX-02": [
    "회귀, 분류, 군집",
    "실생활 및 사회문제"
  ],
  "HI-04-AC-CO-01": [
    "자동화하기 어려웠던 문제",
    "인공지능"
  ],
  "HI-04-AC-CO-02": [
    "인공지능 플랫폼",
    "기계학습 라이브러리",
    "실생활의 문제 해결 사례"
  ],
  "HI-04-AC-CO-03": [
    "지속가능발전목표",
    "사회 문제 해결"
  ],
  "HI-05-AC-EX-01": [
    "정보 보호와 정보공개",
    "타인의 정보",
    "정보 보호 방법"
  ],
  "HI-05-AC-CO-01": [
    "자신의 진로와의 연관성",
    "진로설계"
  ],
  "HI-05-AC-CO-02": [
    "공급자 측면과 사용자 측면",
    "기기 및 클라우드 접근제어",
    "서⋅논술형"
  ],
  "HI-05-AC-CO-03": [
    "다양한 견해",
    "규칙을 민주적인 방식으로 함께 수립"
  ]
};
function explanationClozeUnits(item){
  const line=engine.lineMap.get(item.lineId);
  if(!line)return [];
  const text=String(item.text||'');
  // The authoritative curriculum wording is never rewritten. Only positions in it are hidden.
  // The same curated recall units used by content-system cloze are reused here.
  // Reviewed per-source-line: prioritize education-focused teaching/assessment cues
  // rather than generic repeated terms. Source text remains byte-for-byte unchanged.
  if(curatedExplanationClozePhrases[item.lineId]){
    const selected=[];
    for(const phrase of curatedExplanationClozePhrases[item.lineId]){
      const start=text.indexOf(phrase);
      if(start<0)continue;
      const end=start+phrase.length;
      if(selected.some(u=>start<u.end&&end>u.start))continue;
      selected.push({text:phrase,start,end});
    }
    return selected.sort((a,b)=>a.start-b.start);
  }
  const candidates=(engine.recallUnitsForLine(line,'whole')||[]).slice();
  if(!candidates.length){
    for(const phrase of explanationFallbackPhrases[item.lineId]||[]){
      const start=text.indexOf(phrase);
      if(start>=0)candidates.push({text:phrase,start,end:start+phrase.length});
    }
  }
  const safe=[];
  for(const u of candidates){
    if(!Number.isInteger(u.start)||!Number.isInteger(u.end)||u.end<=u.start)continue;
    if(u.start<0||u.end>text.length||text.slice(u.start,u.end)!==u.text)continue;
    if(u.end-u.start>16||u.start===0&&u.end===text.length)continue;
    if(safe.some(v=>u.start<v.end&&u.end>v.start))continue;
    safe.push(u);
  }
  return safe.sort((a,b)=>a.start-b.start).slice(0,4);
}
function inputRows(items,prefix,mode){
  if(mode==='source')return sourceItems(items,false);
  if(hardModeActive())return `<div class="group-inputs">${items.map((it,i)=>`<div class="cs-source-item cs-cloze-item"><span class="cs-num">${i+1}</span><div class="cs-cloze-content">${renderHardClozeText(it.text,it.lineId,prefix)}</div></div>`).join('')}</div>`;
  const semantic=['해설','고려사항','적용 시 고려 사항'].includes(prefix);
  if(semantic&&['mask','cloze'].includes(mode)){
    return `<div class="group-inputs semantic-cloze-list">${items.map((it,i)=>{
      const units=explanationClozeUnits(it);
      const content=units.length?renderWithSpans(it.text,units,(u,j)=>mode==='mask'
        ?`<span class="mask" data-reveal>${esc(u.text)}</span>`
        :`<input class="inline-input semantic-inline-input" data-line-id="${esc(it.lineId)}" data-answer="${esc(u.text)}" aria-label="${esc(prefix)} ${i+1}번 핵심 표현 ${j+1}" autocomplete="off">`):esc(it.text);
      return `<div class="cs-source-item semantic-cloze-row"><span class="cs-num">${i+1}</span><div class="cs-cloze-content">${content}</div></div>`;
    }).join('')}</div>`;
  }
  if(mode==='mask')return sourceItems(items,true);
  return `<div class="group-inputs">${items.map((it,i)=>mode==='typing'
    ? `<label class="group-input-row copy-mode trace-copy-row"><span class="num">${i+1}</span><span class="trace-copy-stack"><small class="trace-guide">${esc(it.text)}</small><textarea class="group-input trace-answer-textarea" rows="1" data-section="${esc(prefix)}" data-line-id="${esc(it.lineId)}" data-answer="${esc(it.text)}" autocomplete="off"></textarea></span><span class="group-mark"></span></label>`
    : `<label class="group-input-row"><span class="num">${i+1}</span><input class="group-input" data-section="${esc(prefix)}" data-line-id="${esc(it.lineId)}" autocomplete="off"><span class="group-mark"></span></label>`).join('')}</div>`;
}
function valueAttitudeWholeCue(line){
  if(!line||line.family!=='가치·태도')return null;
  const source=String(line.sourceText||'');
  const cues=(line.keywords||[]).filter(k=>{
    const grades=Array.isArray(k.stage3RGrades)?k.stage3RGrades:[];
    return !k.active&&grades.includes('C')&&Number.isInteger(k.start)&&Number.isInteger(k.end)&&k.end>k.start&&source.slice(k.start,k.end)===k.text;
  });
  if(!cues.length)return null;
  const ix=(Math.max(1,Number(state.round||1))-1)%cues.length;
  const k=cues[ix];
  return {text:k.text,start:k.start,end:k.end,recognitionCue:true};
}
function contentSystemItemHtml(task,it,family,mode,itemIx){
  const focus=task?.focus||{kind:'whole',lineIds:[it.lineId]},active=!!focus.lineIds?.includes(it.lineId);
  if(hardModeActive())return `<div class="cs-source-item cs-cloze-item"><span class="cs-num">${itemIx+1}</span><div class="cs-cloze-content">${renderHardClozeText(it.text,it.lineId,family)}</div></div>`;
  if(mode==='source'||!active)return `<div class="cs-source-item"><span class="cs-num">${itemIx+1}</span><span>${esc(it.text)}</span></div>`;

  // 지식·이해는 회상 난이도와 무관하게 해당 영역의 항목 전체를 통째로 회상한다.
  if(family==='지식·이해'){
    if(mode==='mask')return `<div class="cs-source-item"><span class="cs-num">${itemIx+1}</span><span class="mask" data-reveal>${esc(it.text)}</span></div>`;
    if(mode==='typing')return `<label class="cs-input-item cs-typing-item trace-copy-row"><span class="cs-num">${itemIx+1}</span><span class="trace-copy-stack"><small class="trace-guide">${esc(it.text)}</small><textarea class="group-input trace-answer-textarea" rows="1" data-section="${esc(family)}" data-line-id="${esc(it.lineId)}" data-answer="${esc(it.text)}" autocomplete="off"></textarea></span><span class="group-mark"></span></label>`;
    return `<label class="cs-input-item"><span class="cs-num">${itemIx+1}</span><input class="group-input" data-section="${esc(family)}" data-line-id="${esc(it.lineId)}" autocomplete="off"><span class="group-mark"></span></label>`;
  }

  const line=engine.lineMap.get(it.lineId);
  let units=line?engine.recallUnitsForLine(line,focus.kind):[];
  let recognitionCueOnly=false;

  if(line&&family==='가치·태도'&&focus.kind==='whole'&&!units.length){
    const cue=valueAttitudeWholeCue(line);
    if(cue){units=[cue];recognitionCueOnly=true;}
  }

  if(mode==='typing'){
    return `<label class="cs-input-item cs-typing-item trace-copy-row"><span class="cs-num">${itemIx+1}</span><span class="trace-copy-stack"><small class="trace-guide">${esc(it.text)}</small><textarea class="group-input trace-answer-textarea" rows="1" data-section="${esc(family)}" data-line-id="${esc(it.lineId)}" data-answer="${esc(it.text)}" autocomplete="off"></textarea></span><span class="group-mark"></span></label>`;
  }
  if(!line||!units.length)return `<div class="cs-source-item"><span class="cs-num">${itemIx+1}</span><span>${esc(it.text)}</span></div>`;

  if(mode==='mask'){
    return `<div class="cs-source-item"><span class="cs-num">${itemIx+1}</span><span>${renderWithSpans(it.text,units,k=>`<span class="mask" data-reveal>${esc(k.text)}</span>`)}</span></div>`;
  }

  return `<div class="cs-source-item cs-cloze-item"><span class="cs-num">${itemIx+1}</span><div class="cs-cloze-content">${renderWithSpans(it.text,units,(k,i)=>`<input class="inline-input cs-inline-input" data-line-id="${esc(it.lineId)}" data-answer="${esc(k.text)}" ${recognitionCueOnly?'data-review-policy="recognition-cue"':''} aria-label="${esc(family)} 빈칸 ${i+1}" autocomplete="off">`)}</div></div>`;
}
function contentSystemSectionHtml(task,family,items,mode){
  return items.map((it,i)=>contentSystemItemHtml(task,it,family,mode,i)).join('');
}
function contentSystemHtml(g,mode,task=null){
  const effectiveTask=task||{focus:{kind:'whole',lineIds:g.items.filter(x=>x.recallable||x.family==='지식·이해').map(x=>x.lineId)}};
  const core=g.coreIdeas?.length?`<section class="core-ideas"><div class="section-title">핵심 아이디어</div><div class="cs-items">${contentSystemSectionHtml(effectiveTask,'핵심 아이디어',g.coreIdeas,mode)}</div></section>`:'';
  const table=`<div class="cs-table" role="table"><div class="cs-head" role="row"><div>범주</div><div>내용 요소</div></div>${g.rows.map(row=>`<div class="cs-row" role="row" data-section-block="${esc(row.family)}"><div class="cs-family">${esc(row.family)}</div><div class="cs-items">${contentSystemSectionHtml(effectiveTask,row.family,row.items,mode)}</div></div>`).join('')}</div>`;
  return `<div class="cs-wrap">${core}${table}</div>`;
}
function renderContentSystem(task){el.content.innerHTML=contentSystemHtml(task.group,state.ui.mode,task);if(state.ui.mode==='mask')bindMasks();}
function splitStandardText(text){
  const source=String(text||'');
  const m=source.match(/^\[([^\]]+)\]\s*/);
  if(!m)return {code:'',body:source,offset:0};
  return {code:m[1],body:source.slice(m[0].length),offset:m[0].length};
}
function standardBodyUnits(units,offset,body){
  // 공식 성취기준 코드는 제시하되 빈칸은 본문에만 만든다.
  // 원문 시작부터 이어지는 presentation phrase도 코드 뒤쪽을 잘라 누락 없이 회상한다.
  return (units||[])
    .filter(k=>Number.isInteger(k.start)&&Number.isInteger(k.end)&&k.end>offset&&k.start<offset+body.length)
    .map(k=>{
      const start=Math.max(0,k.start-offset),end=Math.min(body.length,k.end-offset);
      return {...k,start,end,text:body.slice(start,end)};
    })
    .filter(k=>k.end>k.start);
}
function standardItemHtml(task,it,mode,itemIx){
  const active=task.focus?.standardLineIds?.includes(it.lineId);
  const parts=splitStandardText(it.text);
  const code=parts.code||(it.lineId.match(/12데과\d{2}-\d{2}/)||[])[0]||String(itemIx+1);
  const codeHtml=`<span class="standard-code" aria-label="성취기준 코드">${esc(code)}</span>`;

  if(hardModeActive()){
    return `<div class="standard-row standard-cloze-row">${codeHtml}<div class="standard-body cs-cloze-content">${renderHardClozeText(parts.body,it.lineId,`${code} 성취기준`)}</div></div>`;
  }
  if(mode==='source'||!active){
    return `<div class="standard-row standard-source-row">${codeHtml}<span class="standard-body">${esc(parts.body)}</span></div>`;
  }

  const line=engine.lineMap.get(it.lineId);
  const rawUnits=line?engine.recallUnitsForLine(line,task.focus?.kind||state.ui.stage):[];
  const units=standardBodyUnits(rawUnits,parts.offset,parts.body);

  if(mode==='typing'){
    return `<label class="standard-row standard-typing-row">
      ${codeHtml}
      <span class="trace-copy-stack">
        <small class="trace-guide">${esc(parts.body)}</small>
        <textarea class="group-input standard-input trace-answer-textarea" rows="1"
          data-section="성취기준" data-line-id="${esc(it.lineId)}"
          data-answer="${esc(parts.body)}" autocomplete="off"
          aria-label="${esc(code)} 성취기준 본문 따라치기"></textarea>
      </span>
      <span class="group-mark"></span>
    </label>`;
  }

  if(!line||!units.length){
    return `<div class="standard-row standard-source-row">${codeHtml}<span class="standard-body">${esc(parts.body)}</span></div>`;
  }

  if(mode==='mask'){
    return `<div class="standard-row standard-source-row">${codeHtml}<span class="standard-body">${renderWithSpans(parts.body,units,k=>`<span class="mask" data-reveal>${esc(k.text)}</span>`)}</span></div>`;
  }

  return `<div class="standard-row standard-cloze-row">
    ${codeHtml}
    <div class="standard-body cs-cloze-content">${renderWithSpans(parts.body,units,(k,i)=>`<input class="inline-input standard-inline-input" data-line-id="${esc(it.lineId)}" data-answer="${esc(k.text)}" aria-label="${esc(code)} 성취기준 빈칸 ${i+1}" autocomplete="off">`)}</div>
  </div>`;
}
function renderContentStandards(task){
  const mode=state.ui.mode,g=task.group;
  const contentTask=g.content?{type:'content-system',group:g.content,focus:{kind:task.focus?.kind||state.ui.stage,lineIds:task.focus?.contentLineIds||[]}}:null;
  const content=g.content?contentSystemHtml(g.content,mode,contentTask):'';
  const standards=g.standards.length?`<section class="whole-section standards-section"><div class="section-title">성취기준</div><div class="cs-items">${g.standards.map((it,i)=>standardItemHtml(task,it,mode,i)).join('')}</div></section>`:'';
  el.content.innerHTML=`<div class="whole-wrap">${content}${standards}</div>`;
  if(mode==='mask')bindMasks();
}
function renderWholeGroup(g){
  const mode=state.ui.mode;
  // 데이터 과학의 성격·목표는 현재 원문 보존 전용이다.
  // 빈칸이 아직 선별되지 않은 상태에서 400자짜리 문단 전체를 무힌트로 입력시키지 않는다.
  if(g.subject==='data-science'&&g.familyGroup==='character-goals'&&mode==='cloze'&&!hardModeActive()){
    el.content.innerHTML=`<div class="whole-wrap">${g.sections.map(s=>`<section class="whole-section"><div class="section-title">${esc(s.family)} · 원문 보기</div>${sourceItems(s.items,false)}</section>`).join('')}</div>`;
    return;
  }
  // 인공지능 기초 성취기준은 코드와 본문을 분리하여 코드 자체를 묻지 않는다.
  if(g.subject==='ai-basic'&&g.familyGroup==='standards'){
    const task={type:'whole-group',group:g,focus:{kind:'whole',standardLineIds:g.items.map(it=>it.lineId)}};
    el.content.innerHTML=`<div class="whole-wrap"><section class="whole-section standards-section"><div class="section-title">성취기준</div><div class="cs-items">${g.items.map((it,i)=>standardItemHtml(task,it,mode,i)).join('')}</div></section></div>`;
  }else el.content.innerHTML=`<div class="whole-wrap">${g.sections.map(s=>`<section class="whole-section"><div class="section-title">${esc(s.family)}</div>${s.family==='성취기준'?`<div class="cs-items">${s.items.map((it,i)=>standardItemHtml({focus:{kind:'whole',standardLineIds:s.items.map(x=>x.lineId)}},it,mode,i)).join('')}</div>`:inputRows(s.items,s.family,mode)}</section>`).join('')}</div>`;
  if(mode==='mask')bindMasks();
}
function standardLineDisplay(line,mode){
  const parts=splitStandardText(line.sourceText);
  const code=parts.code||(String(line.lineId||'').match(/(?:9정|12정|12인기|12데과)\d{2}-\d{2}/)||[])[0];
  if(!code)return null;
  const badge=`<span class="standard-code" aria-label="성취기준 코드">${esc(code)}</span>`;
  const lineBody=`<div class="standard-row standard-cloze-row">${badge}<div class="standard-body cs-cloze-content">`;
  if(mode==='source')return lineBody+esc(parts.body)+'</div></div>';
  if(hardModeActive())return lineBody+renderHardClozeText(parts.body,line.lineId,`${code} 성취기준`)+'</div></div>';
  const selected=engine.selectedSet(line);
  const raw=mode==='mask'?(line.presentation?.units?.length?line.presentation.units:line.keywords.filter(k=>k.active)):(selected?engine.keywordsForSet(line,selected):[]);
  const units=(raw||[]).slice().sort((a,b)=>a.start-b.start);
  const bodyUnits=standardBodyUnits(units,parts.offset,parts.body);
  if(mode==='mask')return lineBody+renderWithSpans(parts.body,bodyUnits,k=>`<span class="mask" data-reveal>${esc(k.text)}</span>`)+'</div></div>';
  if(!bodyUnits.length)return lineBody+esc(parts.body)+'</div></div>';
  return lineBody+renderWithSpans(parts.body,bodyUnits,(k,i)=>`<input class="inline-input standard-inline-input" data-answer="${esc(k.text)}" aria-label="${esc(code)} 빈칸 ${i+1}" autocomplete="off">`)+'</div></div>';
}
function renderLine(line){
  if(hardModeActive()&&line.family!=='성취기준'){el.content.innerHTML=`<div class="cloze-text hard-cloze-text">${renderHardClozeText(line.sourceText,line.lineId,line.family)}</div>`;return;}
  if(line.family==='성취기준'&&state.ui.mode!=='typing'){
    const html=standardLineDisplay(line,state.ui.mode);
    if(html){el.content.innerHTML=html;if(state.ui.mode==='mask')bindMasks();return;}
  }
  const mode=state.ui.mode;if(mode==='source'){el.content.innerHTML=`<div class="source-text">${esc(line.sourceText)}</div>`;return;}if(mode==='typing'){el.content.innerHTML=`<div class="typing-area trace-typing-area"><div class="trace-guide trace-guide-block">${esc(line.sourceText)}</div><textarea id="typingInput" placeholder="원문을 그대로 입력"></textarea></div>`;return;}
  if(mode==='mask'){const ks=(line.presentation?.units?.length?line.presentation.units:line.keywords.filter(k=>k.active)).slice().sort((a,b)=>a.start-b.start);el.content.innerHTML=`<div class="mask-text">${renderWithSpans(line.sourceText,ks,k=>`<span class="mask" data-reveal>${esc(k.text)}</span>`)}</div>`;bindMasks();return;}
  const set=engine.selectedSet(line),ks=engine.keywordsForSet(line,set);if(!set||!ks.length){el.content.innerHTML=`<div class="source-text">${esc(line.sourceText)}</div>`;return;}el.content.innerHTML=`<div class="cloze-text">${renderWithSpans(line.sourceText,ks,(k,i)=>`<input class="inline-input" data-answer="${esc(k.text)}" aria-label="빈칸 ${i+1}" autocomplete="off">`)}</div>`;
}
function renderWithSpans(text,ks,replacer){let out='',cursor=0;ks.forEach((k,i)=>{out+=esc(text.slice(cursor,k.start))+replacer(k,i);cursor=k.end;});return out+esc(text.slice(cursor));}
function bindMasks(){document.querySelectorAll('[data-reveal]').forEach(x=>x.onclick=()=>x.classList.toggle('revealed'));}
function groupSections(task){
  if(task.type==='content-system')return [...(task.group.coreIdeas?.length?[{family:'핵심 아이디어',items:task.group.coreIdeas}]:[]),...task.group.rows];
  if(task.type==='content-standards')return [...(task.group.content?.coreIdeas?.length?[{family:'핵심 아이디어',items:task.group.content.coreIdeas}]:[]),...(task.group.content?.rows||[]),...(task.group.standards.length?[{family:'성취기준',items:task.group.standards}]:[])];
  if(task.type==='ki')return [{family:'지식·이해',items:task.group.items||[]}];
  return task.group?.sections||[];
}
function statusLabel(status,reason=''){
  if(status==='correct')return '정답';
  if(status==='near')return reason?`확인 · ${CL.grading.reasonLabel(reason)}`:'표기 확인';
  if(status==='unknown')return '모름';
  if(status==='duplicate')return '중복';
  return '오답';
}
function statusClass(status){return status==='correct'?'good':status==='near'?'near':status==='unknown'?'unknown':'bad';}
function gradeCounts(statuses){const out={correct:0,near:0,unknown:0,wrong:0,duplicate:0};statuses.forEach(s=>{if(out[s]!=null)out[s]++;});return out;}
function taskStatusFrom(statuses){return CL.grading.aggregateStatus(statuses.map(s=>s==='duplicate'?'wrong':s));}
function fieldNote(field){return field.closest('.answer-field-wrap')?.querySelector('.field-note')||null;}
function fieldMark(field){return field.closest('.group-input-row,.cs-input-item,.ki-row')?.querySelector('.group-mark,.ki-mark')||null;}
function resetFieldVisual(field){
  ['correct','near','unknown','wrong'].forEach(c=>field.classList.remove(c));
  const note=fieldNote(field);if(note){note.textContent='';note.className='field-note';}
  const mark=fieldMark(field);if(mark){mark.textContent='';mark.className=mark.classList.contains('ki-mark')?'ki-mark':'group-mark';}
}
// 정답을 맞힌 경우에만 사용자가 쓴 표기를 교육과정의 공식 정답 표기로 정리한다.
// 정답 인정 기준은 기존 grading 모듈 그대로 유지한다. near/오답 답안은 건드리지 않는다.
function formatCorrectInput(field,detail,expected,save=true){
  if(!field||detail?.status!=='correct')return;
  // 지식·이해 묶음 따라치기는 여러 행을 입력하므로 개별 정답을 아래에서 처리한다.
  if(field.id==='typingInput'&&currentTask()?.type==='ki')return;
  const official=String(expected||detail.expected||'').trim();
  if(!official||field.value===official)return;
  field.value=official;
  if(save&&field.dataset.fieldKey)CL.storage.setDraft(state,field.dataset.fieldKey,official);
  resizeAnswerField(field);
}
function applyFieldGrade(field,detail,expected='',save=true){
  if(!field||!detail)return;
  formatCorrectInput(field,detail,expected,save);
  resetFieldVisual(field);
  const status=detail.status==='duplicate'?'wrong':detail.status;
  field.classList.add(status);
  const label=statusLabel(detail.status,detail.reason),mark=fieldMark(field),note=fieldNote(field);
  if(mark){mark.textContent=label;mark.className=(mark.classList.contains('ki-mark')?'ki-mark ':'group-mark ')+statusClass(detail.status);}
  const answer=String(expected||detail.expected||detail.matched||'').trim();
  if(note){
    if(detail.status==='correct')note.textContent='';
    else if(detail.status==='near')note.textContent=answer?`정답: ${answer}`:'공식 표현을 다시 확인하세요.';
    else if(detail.status==='unknown')note.textContent=answer?`정답: ${answer}`:'미입력';
    else if(detail.status==='duplicate')note.textContent=answer?`이미 사용한 답 · ${answer}`:'이미 사용한 답';
    else note.textContent=answer?`정답: ${answer}`:'정답을 확인하세요.';
    note.className='field-note '+statusClass(detail.status);
  }
  if(save&&field.dataset.fieldKey)CL.storage.setFieldGrade(state,field.dataset.fieldKey,{status:detail.status,reason:detail.reason||'',expected:answer});
}
function recordMatchedItem(items,result){
  if(result?.answerIndex!=null&&items[result.answerIndex])CL.storage.recordItem(state,items[result.answerIndex].lineId,result.status==='duplicate'?'wrong':result.status);
}
// 집합형(순서 무관) 정답은 맞힌 항목을 먼저 예약하고,
// 틀렸거나 비운 칸에는 남은 원문 항목을 한 번씩 배정한다.
// grading 모듈의 정답/오답 판정은 그대로 두고 expected 표시만 교정한다.
function distinctExpectedResults(results,answers){
  const reserved=new Set();
  results.forEach(r=>{
    if(['correct','near'].includes(r.status)&&Number.isInteger(r.answerIndex)
       &&r.answerIndex>=0&&r.answerIndex<answers.length)reserved.add(r.answerIndex);
  });
  const remainder=answers.map((_,i)=>i).filter(i=>!reserved.has(i));
  return results.map((r,i)=>{
    if(['correct','near'].includes(r.status)&&Number.isInteger(r.answerIndex))return {...r,expected:String(answers[r.answerIndex]||'')};
    const index=remainder.shift();
    return {...r,expected:String(answers[index]??answers[i]??''),displayAnswerIndex:index??i};
  });
}
function unorderedFieldsFor(field){
  if(field.classList.contains('ki-input'))return answerFields().filter(f=>f.classList.contains('ki-input'));
  const section=field.dataset.section||'';
  return answerFields().filter(f=>f.classList.contains('group-input')&&!f.dataset.answer&&f.dataset.section===section);
}
function gradedUnorderedField(field,task){
  const fields=unorderedFieldsFor(field),index=fields.indexOf(field),items=expectedItemsForField(field,task);
  if(index<0||!items.length)return null;
  const results=CL.grading.gradeSetDetailed(fields.map(f=>f.value),items.map(it=>it.text)).results;
  return {detail:distinctExpectedResults(results,items.map(it=>it.text))[index],items};
}
function gradeSetFields(fields,items,save=true){
  const answers=items.map(x=>x.text),grade=CL.grading.gradeSetDetailed(fields.map(x=>x.value),answers),matched=new Set();
  const displayResults=distinctExpectedResults(grade.results,answers);
  displayResults.forEach((r,i)=>{
    const f=fields[i];if(!f)return;
    applyFieldGrade(f,r,r.expected,save);
    if(r.answerIndex!=null&&(r.status==='correct'||r.status==='near'))matched.add(r.answerIndex);
    recordMatchedItem(items,r);
    // 과정·기능은 영역의 원래 빈칸을 한 카드에서 함께 풀도록 한다.
    // 지식·이해 등 다른 범주의 집합형 재인출은 기존 규칙을 그대로 사용한다.
    const processFunction=fields[0]?.dataset.section==='과정·기능';
    if(r.status==='correct')cancelFieldRetry(f);
    else if(processFunction&&r.status==='near'&&r.answerIndex!=null)scheduleProcessFunctionItemRetry(items[r.answerIndex],f,r.status);
    else if(!processFunction)scheduleFieldRetry(f,r.status,r,r.answerIndex!=null?items[r.answerIndex]:null);
    noteAnswerAttempt();
  });
  const failureStatus=grade.results.some(r=>['wrong','duplicate'].includes(r.status))?'wrong':'unknown';
  items.forEach((it,i)=>{
    if(!matched.has(i)){
      CL.storage.recordItem(state,it.lineId,failureStatus);
      if(fields[0]?.dataset.section==='과정·기능')scheduleProcessFunctionItemRetry(it,fields[0],failureStatus);
    }
  });
  return {statuses:grade.results.map(r=>r.status),matched:grade.matchedCount,total:grade.total};
}
function scheduleProcessFunctionItemRetry(item,field,status){
  if(!state.ui.retry||!item?.lineId)return;
  scheduleProcessBundle(engine.lineMap.get(item.lineId),status);
}
function expectedItemsForField(field,task){
  if(field.classList.contains('ki-input')||(field.id==='typingInput'&&task?.type==='ki'))return task?.group?.items||[];
  const family=field.dataset.section;if(!family)return [];
  return groupSections(task).find(s=>s.family===family)?.items||[];
}
function claimedExpectedNorms(field){
  const rowSelector=field.classList.contains('ki-input')?'.ki-input':`.group-input[data-section="${CSS.escape(field.dataset.section||'')}"]:not([data-answer])`;
  const claimed=new Set();
  document.querySelectorAll(rowSelector).forEach(other=>{if(other===field)return;const g=other.dataset.fieldKey?CL.storage.getFieldGrade(state,other.dataset.fieldKey):null;if(g&&['correct','near'].includes(g.status)&&g.expected)claimed.add(CL.grading.norm(g.expected));});
  return claimed;
}
function fixedExpectedForField(field,task){
  if(field.dataset.answer)return field.dataset.answer;
  if(field.id==='typingInput'&&task?.type==='line')return task.line.sourceText;
  return '';
}
function gradeFixedField(field,expected,save=true){
  const detail=CL.grading.classifyDetailed(field.value,expected);applyFieldGrade(field,detail,expected,save);
  const recognitionCue=field.dataset.reviewPolicy==='recognition-cue';
  if(field.dataset.lineId&&!recognitionCue)CL.storage.recordItem(state,field.dataset.lineId,detail.status);
  if(detail.status==='correct')cancelFieldRetry(field);else scheduleFieldRetry(field,detail.status,{...detail,expected},null);
  noteAnswerAttempt();
  return detail;
}
function gradeUnorderedField(field,task,save=true){
  const chosen=gradedUnorderedField(field,task);if(!chosen)return null;
  const {items,detail}=chosen;
  applyFieldGrade(field,detail,detail.expected,save);recordMatchedItem(items,detail);
  if(detail.status==='correct')cancelFieldRetry(field);else scheduleFieldRetry(field,detail.status,detail,detail.answerIndex!=null?items[detail.answerIndex]:null);
  return detail;
}
function check(){
  const task=currentTask();if(!task)return;const mode=state.ui.mode;
  if(mode==='source'||mode==='mask'){el.feedback.textContent='이 모드는 채점하지 않습니다.';return;}
  const statuses=[],processed=new Set();
  if(task.type==='ki'&&mode==='typing'){
    const field=$('typingInput'),items=task.group.items,values=String(field?.value||'').split(/\n+/).map(x=>x.trim()),r=CL.grading.gradeSetDetailed(values,items.map(x=>x.text));
    const status=r.status,detail={status,reason:status==='unknown'?'empty':'meaning',expected:items.map(x=>x.text).join(' / ')};
    applyFieldGrade(field,detail,detail.expected);
    if(status==='correct'&&field){
      // 한 입력칸에 여러 지식·이해 요소를 입력한 경우, 매칭된 순서대로 각 행을 공식 표기로 교정한다.
      field.value=r.results.map(x=>x.expected||'').join('\n');
      if(field.dataset.fieldKey)CL.storage.setDraft(state,field.dataset.fieldKey,field.value);
      resizeAnswerField(field);
    }
    const matched=new Set();
    r.results.forEach(result=>{
      if(result.answerIndex!=null){
        CL.storage.recordItem(state,items[result.answerIndex].lineId,result.status);
        if(['correct','near'].includes(result.status))matched.add(result.answerIndex);
      }
    });
    const failureStatus=r.results.some(x=>['wrong','duplicate'].includes(x.status))?'wrong':'unknown';
    items.forEach((it,i)=>{if(!matched.has(i))CL.storage.recordItem(state,it.lineId,failureStatus);});
    if(status==='correct')cancelFieldRetry(field);else scheduleFieldRetry(field,status,detail,null);
    noteAnswerAttempt();
    statuses.push(status);
  }else{
    const unorderedFamilies=new Map();
    document.querySelectorAll('.group-input:not([data-answer]),.ki-input').forEach(field=>{const key=field.classList.contains('ki-input')?'지식·이해':field.dataset.section||'';if(!unorderedFamilies.has(key))unorderedFamilies.set(key,[]);unorderedFamilies.get(key).push(field);});
    unorderedFamilies.forEach((fields,family)=>{const items=family==='지식·이해'&&task.type==='ki'?task.group.items:(groupSections(task).find(s=>s.family===family)?.items||[]);const r=gradeSetFields(fields,items);r.statuses.forEach(x=>statuses.push(x));fields.forEach(x=>processed.add(x));});
    document.querySelectorAll('.inline-input,.group-input[data-answer]').forEach(field=>{if(processed.has(field))return;const d=gradeFixedField(field,fixedExpectedForField(field,task));statuses.push(d.status);});
    if(task.type==='line'&&mode==='typing'){
      const field=$('typingInput');if(field){const d=gradeFixedField(field,task.line.sourceText);statuses.push(d.status);}
    }
  }
  if(!statuses.length){el.feedback.textContent='채점할 입력칸이 없습니다.';el.feedback.className='feedback';return;}
  const status=taskStatusFrom(statuses),counts=gradeCounts(statuses);
  const parts=[counts.correct?`정확 ${counts.correct}`:'',counts.near?`확인 ${counts.near}`:'',counts.unknown?`모름 ${counts.unknown}`:'',(counts.wrong+counts.duplicate)?`오답 ${counts.wrong+counts.duplicate}`:''].filter(Boolean);
  el.feedback.textContent=status==='correct'?'전체 정답':parts.join(' · ');el.feedback.className='feedback '+statusClass(status);
  CL.storage.record(state,engine.taskId(task),status);persist();
  if(status==='correct')schedulePracticalAutoAdvance();
}
function fillAllClozeAnswers(){
  // 정답 채우기는 학습 화면의 입력값만 채우며 채점 및 오답 기록을 생성하지 않는다.
  if(state.ui.mode!=='cloze')return;
  const task=currentTask();if(!task)return;
  const sections=isGroupTask(task)?groupSections(task):[];
  const fields=answerFields();
  const familyPositions=new Map();
  fields.forEach(field=>{
    let expected=String(field.dataset.answer||'');
    if(!expected&&field.classList.contains('group-input')){
      const family=field.dataset.section||'';
      const items=sections.find(x=>x.family===family)?.items||[];
      const pos=familyPositions.get(family)||0;
      expected=String(items[pos]?.text||'');
      familyPositions.set(family,pos+1);
    }
    if(!expected&&field.classList.contains('ki-input')&&isKITask(task)){
      const family='지식·이해';
      const pos=familyPositions.get(family)||0;
      expected=String(task.group.items[pos]?.text||'');
      familyPositions.set(family,pos+1);
    }
    if(!expected)return;
    field.value=expected;
    if(field.dataset.fieldKey){
      CL.storage.setDraft(state,field.dataset.fieldKey,expected);
      CL.storage.clearFieldGrade(state,field.dataset.fieldKey);
    }
    resetFieldVisual(field);
    resizeAnswerField(field);
  });
  el.feedback.textContent='';el.feedback.className='feedback';
  persist();
}
function sourceInfo(){
  const task=currentTask();if(!task)return;const c=taskContext(task);let official='';
  if(isGroupTask(task))official=groupSections(task).map(s=>`[${s.family}]\n${s.items.map(x=>'• '+x.text).join('\n')}`).join('\n\n');else if(isKITask(task))official=task.group.items.map(x=>'• '+x.text).join('\n');else official=task.line.sourceText;
  el.dialogBody.className='source-dialog-body';el.dialogBody.innerHTML=`<dl><dt>문서</dt><dd>${esc(CL.config.officialSource)}</dd><dt>과목</dt><dd>${esc(c.subject)}</dd><dt>영역</dt><dd>${esc(c.area)}</dd><dt>구분</dt><dd>${esc(c.family)}</dd><dt>ID</dt><dd><code>${esc(c.id)}</code></dd></dl><div class="official">${esc(official)}</div>`;el.dialog.showModal();
}


function renderProvenance(task){
  if(!el.provenance||!task)return;
  const c=taskContext(task),texts=[];
  if(isGroupTask(task))groupSections(task).forEach(sec=>sec.items.forEach(it=>texts.push(it.text)));
  else if(isKITask(task))task.group.items.forEach(it=>texts.push(it.text));
  else texts.push(task.line?.sourceText||'');
  const codes=[...new Set(texts.flatMap(t=>String(t).match(/\[[^\]]+\]/g)||[]))];
  const range=codes.length?(codes.length<=4?codes.join(' · '):`${codes[0]} ~ ${codes[codes.length-1]}`):'';
  const parts=['출처', '교육부 「2022 개정 교육과정 [별책10] 실과(기술·가정)/정보과 교육과정」', c.subject, c.area, c.family];
  if(range)parts.push(`성취기준 ${range}`);
  el.provenance.textContent=parts.filter(Boolean).join(' · ');
}
function answerField(target){return target?.closest?.('.inline-input,.group-input,.ki-input,#typingInput')||null;}
function answerFields(){return [...el.content.querySelectorAll('.inline-input,.group-input,.ki-input,#typingInput')].filter(x=>!x.disabled);}
function makeFieldKey(field,index){const task=currentTask(),taskId=task?engine.taskId(task):'none';const subject=task?.group?.subject||task?.line?.subject||'';return [taskId,state.ui.stage,state.ui.mode,...(hardModeActive()?['hard-v1']:[]),index,...(subject==='ai-basic'?['semantic-v4']:[])].join('|');}

function resizeAnswerField(field){
  if(!field)return;
  if(field.tagName==='TEXTAREA'){
    field.style.height='auto';
    const min=field.classList.contains('trace-answer-textarea')?34:120;
    field.style.height=`${Math.max(min,field.scrollHeight)}px`;
    return;
  }
  if(field.classList.contains('hard-whole-input')){
    // 통빈칸은 일반 단어 빈칸의 190px 제한을 적용하지 않는다.
    field.style.removeProperty('--cloze-width');
    field.style.fontSize=window.innerWidth<=480?'13px':'14px';
    field.title=String(field.value||field.dataset.answer||'');
    return;
  }
  if(field.classList.contains('inline-input')||field.classList.contains('cs-inline-input')||field.classList.contains('standard-inline-input')){
    // 빈칸을 과도하게 확장하지 않는다. 짧고 고정적인 폭 안에서 글꼴 크기를 조정한다.
    const expected=String(field.dataset.answer||'');
    const value=String(field.value||'');
    const target=value||expected;
    const canvas=resizeAnswerField.canvas||(resizeAnswerField.canvas=document.createElement('canvas'));
    const ctx=canvas.getContext('2d');
    const body=field.closest('.cs-cloze-content,.cloze-text,.standard-body')||field.parentElement;
    const room=body?.clientWidth||window.innerWidth-32;
    const narrow=window.innerWidth<=760;
    const widthCap=narrow?156:190;
    const minWidth=narrow?82:90;
    const maxWidth=Math.max(minWidth,Math.min(widthCap,window.innerWidth-32,room-8));
    const styles=getComputedStyle(field);
    const family=styles.fontFamily||'sans-serif';
    const weight=styles.fontWeight||'700';
    const measure=(size,text)=>{
      if(!ctx)return [...text].length*size;
      ctx.font=`${weight} ${size}px ${family}`;
      return ctx.measureText(text).width;
    };
    const natural=measure(12.5,target)+16;
    const width=Math.max(minWidth,Math.min(maxWidth,Math.ceil(natural)));
    const fontSize=target?Math.max(9.5,Math.min(12.5,12.5*(width-16)/Math.max(1,measure(12.5,target)))):12.5;
    field.style.setProperty('--cloze-width',`${width}px`);
    field.style.fontSize=`${fontSize.toFixed(2)}px`;
    field.style.fontWeight='650';
    field.title=value||expected;
  }
}
function prepareAnswerFields(){
  const fields=answerFields();
  fields.forEach((field,index)=>{
    field.spellcheck=false;field.setAttribute('spellcheck','false');field.setAttribute('autocorrect','off');field.setAttribute('autocapitalize','off');
    field.dataset.fieldKey=makeFieldKey(field,index);
    if(!field.closest('.answer-field-wrap')){
      const wrap=document.createElement('span');wrap.className='answer-field-wrap'+(field.tagName==='TEXTAREA'?' block':'')+(field.classList.contains('inline-input')?' inline':'');
      field.parentNode.insertBefore(wrap,field);wrap.appendChild(field);
      const note=document.createElement('small');note.className='field-note';wrap.appendChild(note);
    }
    const expected=field.dataset.answer||'';
    const ch=Math.max(8,Math.min(48,[...expected].length||18));field.style.setProperty('--answer-ch',String(ch));
    const draft=CL.storage.getDraft(state,field.dataset.fieldKey);if(draft!==''&&field.value==='')field.value=draft;
    const saved=CL.storage.getFieldGrade(state,field.dataset.fieldKey);if(saved)applyFieldGrade(field,saved,saved.expected,false);
    resizeAnswerField(field);
  });
  // 구버전에서 미입력 2칸 모두 첫 정답으로 저장된 경우도 표시를 재계산한다.
  const task=currentTask(),groups=new Map();
  fields.filter(f=>f.classList.contains('ki-input')||(f.classList.contains('group-input')&&!f.dataset.answer)).forEach(f=>{
    const key=f.classList.contains('ki-input')?'지식·이해':f.dataset.section||'';
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(f);
  });
  groups.forEach(group=>{
    if(!group.length)return;
    const items=expectedItemsForField(group[0],task),answers=items.map(it=>it.text);
    if(!answers.length)return;
    const saved=group.map(f=>CL.storage.getFieldGrade(state,f.dataset.fieldKey));
    const results=saved.map((g,i)=>{
      const answerIndex=g&&['correct','near'].includes(g.status)?answers.findIndex(a=>CL.grading.norm(a)===CL.grading.norm(g.expected||group[i].value)):-1;
      return {status:g?.status||'unknown',answerIndex:answerIndex>=0?answerIndex:null,expected:g?.expected||''};
    });
    const display=distinctExpectedResults(results,answers);
    group.forEach((f,i)=>{if(saved[i]&&!['correct','near'].includes(saved[i].status))applyFieldGrade(f,saved[i],display[i].expected,false);});
  });
  if(fields.length&&state.ui.mode!=='source'&&state.ui.mode!=='mask')requestAnimationFrame(()=>{
    if(!el.content.contains(document.activeElement)){
      const f=fields.find(x=>!CL.storage.getFieldGrade(state,x.dataset.fieldKey))||fields[0];
      focusAnswerField(f,false);
    }
  });
}
function focusAnswerField(field,smooth=true){if(!field)return;try{field.focus({preventScroll:true});}catch(_){field.focus();}if(typeof field.select==='function'&&field.value)field.select();field.scrollIntoView({block:'center',behavior:smooth?'smooth':'auto'});}
function nextAnswerField(field){const fields=answerFields(),i=fields.indexOf(field);for(let n=i+1;n<fields.length;n++){const g=CL.storage.getFieldGrade(state,fields[n].dataset.fieldKey);if(!g||g.status!=='correct')return fields[n];}return fields[i+1]||null;}
function clearFieldState(field){resetFieldVisual(field);if(field.dataset.fieldKey)CL.storage.clearFieldGrade(state,field.dataset.fieldKey);}

function retryIdForField(field){
  const task=currentTask(),section=field.dataset.section||'';
  const unordered=field.classList.contains('ki-input')||(field.id==='typingInput'&&task?.type==='ki')||(field.classList.contains('group-input')&&!field.dataset.answer&&section);
  if(unordered)return `${engine.taskId(task)}|SET:${section||'지식·이해'}|round:${state.round||1}`;
  return `${field.dataset.fieldKey||''}|round:${state.round||1}`;
}
function cancelFieldRetry(field){
  // 정답으로 변경되어도 기존 오답카드는 보존한다. 자동 해제 금지.
  return;
}
function scheduleFieldRetry(field,status,detail=null,matchedItem=null){
  if(!state.ui.retry||!field?.dataset?.fieldKey||status==='correct')return;
  state.fieldRetries=state.fieldRetries||{};
  state.fieldRetryCounts=state.fieldRetryCounts||{};
  const task=currentTask(),id=retryIdForField(field);
  const count=Number(state.fieldRetryCounts[id]||0);
  // 재인출 횟수 제한은 재인출 실패 처리에만 적용한다.
  // 여기서 새 오답 생성을 막으면 동일 빈칸을 다시 틀렸을 때 카드가 영구히 사라진다.
  if(!state.fieldRetries[id])state.fieldRetryCounts[id]=count+1;
  // Do not activate the floating card on a wrong answer. The review tab opens it on demand.

  const ctx=taskContext(task),section=field.dataset.section||ctx.family||'빈칸';
  const lineId=matchedItem?.lineId||field.dataset.lineId||task?.line?.lineId||'';
  const line=lineId?engine.lineMap.get(lineId):null;
  const recognitionCue=field.dataset.reviewPolicy==='recognition-cue';
  const expected=String(detail?.expected||fixedExpectedForField(field,task)||matchedItem?.text||'').trim();
  const kiTyping=field.id==='typingInput'&&task?.type==='ki';
  const unordered=field.classList.contains('ki-input')||kiTyping||(field.classList.contains('group-input')&&!field.dataset.answer&&section);
  // 성취기준이나 지식·이해에는 영향 없이 과정·기능 원문만 영역 단위로 묶는다.
  if(line?.family==='과정·기능'&&state.ui.mode==='cloze'){scheduleProcessBundle(line,status);return;}

  if(unordered&&section==='과정·기능'){
    const items=expectedItemsForField(field,task);
    const fields=answerFields().filter(x=>x.classList.contains('group-input')&&!x.dataset.answer&&x.dataset.section==='과정·기능');
    const selected=matchedItem||items[Math.max(0,fields.indexOf(field))]||items[0];
    if(selected)scheduleProcessFunctionItemRetry(selected,field,status);
    return;
  }
  if(unordered){
    const fields=answerFields().filter(x=>{
      if(kiTyping)return x===field;
      if(field.classList.contains('ki-input'))return x.classList.contains('ki-input');
      return x.classList.contains('group-input')&&!x.dataset.answer&&x.dataset.section===section;
    });
    const items=expectedItemsForField(field,task);
    const existing=state.fieldRetries[id]||{};
    state.fieldRetries[id]={
      ...existing,
      kind:'set',
      sourceMode:kiTyping?'single-multiline':'multi-field',
      fieldKey:field.dataset.fieldKey,
      sourceFieldKeys:fields.map(x=>x.dataset.fieldKey),
      fieldIndex:answerFields().indexOf(field),
      lineIds:items.map(x=>x.lineId).filter(Boolean),
      setAnswers:items.map(x=>x.text),
      section,
      subject:task?.group?.subject||task?.line?.subject||state.ui.subject,
      subjectLabel:ctx.subject,
      area:ctx.area,
      contextText:`${ctx.area} 영역의 ${section} 내용 요소`,
      taskId:engine.taskId(task),
      round:Number(state.round||1),
      dueAt:Math.min(Number(existing.dueAt||Infinity),Number(state.answerSerial||0)+Number(CL.config.retryDelay??0)),
      status,
      lastWrongSerial:Number(state.answerSerial||0)+1,
      scope:{subject:state.ui.subject,area:state.ui.area,family:state.ui.family,stage:state.ui.stage,mode:state.ui.mode}
    };
    return;
  }

  const existing=state.fieldRetries[id]||{};
  state.fieldRetries[id]={
    ...existing,
    kind:'single',
    recognitionCue,
    fieldKey:field.dataset.fieldKey,
    fieldIndex:answerFields().indexOf(field),
    lineId,
    section,
    subject:line?.subject||task?.group?.subject||task?.line?.subject||state.ui.subject,
    subjectLabel:ctx.subject,
    area:line?.area||ctx.area,
    correctAnswer:expected,
    contextText:line?.sourceText||ctx.family||'',
    taskId:engine.taskId(task),
    round:Number(state.round||1),
    dueAt:Math.min(Number(existing.dueAt||Infinity),Number(state.answerSerial||0)+Number(CL.config.retryDelay??0)),
    status,
    lastWrongSerial:Number(state.answerSerial||0)+1,
    scope:{subject:state.ui.subject,area:state.ui.area,family:state.ui.family,stage:state.ui.stage,mode:state.ui.mode}
  };
}
function dueRetryForCurrentTask(){
  state.fieldRetries=state.fieldRetries||{};
  const task=currentTask();if(!task)return null;
  const taskId=engine.taskId(task),serial=Number(state.answerSerial||0),round=Number(state.round||1);
  const candidates=Object.entries(state.fieldRetries)
    .filter(([,r])=>r&&r.taskId===taskId&&Number(r.round)===round&&Number(r.dueAt)<=serial)
    .sort((a,b)=>Number(a[1].dueAt)-Number(b[1].dueAt));
  return candidates[0]||null;
}
function activateDueFieldRetry(){
  const due=dueRetryForCurrentTask();if(!due)return false;
  const [id,retry]=due;
  const field=answerFields().find(x=>x.dataset.fieldKey===retry.fieldKey);
  if(!field)return false;
  const saved=CL.storage.getFieldGrade(state,field.dataset.fieldKey);
  if(saved?.status==='correct'){
    return false;
  }
  field.value='';
  CL.storage.setDraft(state,field.dataset.fieldKey,'');
  CL.storage.clearFieldGrade(state,field.dataset.fieldKey);
  resetFieldVisual(field);
  field.classList.add('retry-due');
  const note=fieldNote(field);
  if(note){note.textContent='다시';note.className='field-note retry';}
  delete state.fieldRetries[id];
  persist();
  setTimeout(()=>focusAnswerField(field,true),40);
  return true;
}
function noteAnswerAttempt(){
  state.answerSerial=Number(state.answerSerial||0)+1;
}
function gradeSingleAnswerField(field){
  const task=currentTask();if(!task||!field)return null;let detail=null,matchedItem=null,setGrade=null;
  if(field.id==='typingInput'&&task.type==='ki'){
    const values=String(field.value||'').split(/\n+/).map(x=>x.trim());
    setGrade=CL.grading.gradeSetDetailed(values,task.group.items.map(x=>x.text));
    detail={status:setGrade.status,reason:setGrade.status==='unknown'?'empty':'meaning',expected:task.group.items.map(x=>x.text).join(' / ')};
  }else{
    const expected=fixedExpectedForField(field,task);
    if(expected)detail=CL.grading.classifyDetailed(field.value,expected);
    else{
      const chosen=gradedUnorderedField(field,task);
      if(chosen){detail=chosen.detail;if(detail.answerIndex!=null)matchedItem=chosen.items[detail.answerIndex];}
    }
  }
  if(!detail)return null;
  const expected=detail.expected||fixedExpectedForField(field,task)||'';
  applyFieldGrade(field,detail,expected,true);
  if(setGrade?.status==='correct'){
    field.value=setGrade.results.map(x=>x.expected||'').join('\n');
    if(field.dataset.fieldKey)CL.storage.setDraft(state,field.dataset.fieldKey,field.value);
    resizeAnswerField(field);
  }
  const recognitionCue=field.dataset.reviewPolicy==='recognition-cue';
  if(setGrade&&task.type==='ki'){
    const matched=new Set();
    setGrade.results.forEach(result=>{
      if(result.answerIndex!=null){
        CL.storage.recordItem(state,task.group.items[result.answerIndex].lineId,result.status);
        if(['correct','near'].includes(result.status))matched.add(result.answerIndex);
      }
    });
    const failureStatus=setGrade.results.some(x=>['wrong','duplicate'].includes(x.status))?'wrong':'unknown';
    task.group.items.forEach((it,i)=>{if(!matched.has(i))CL.storage.recordItem(state,it.lineId,failureStatus);});
  }else if(!recognitionCue){
    if(matchedItem)CL.storage.recordItem(state,matchedItem.lineId,detail.status);
    else if(field.dataset.lineId)CL.storage.recordItem(state,field.dataset.lineId,detail.status);
  }

  noteAnswerAttempt();
  if(detail.status==='correct')cancelFieldRetry(field);
  else scheduleFieldRetry(field,detail.status,detail,matchedItem);

  // 개별 Enter 채점은 입력칸 근처 피드백만 사용한다.
  // 전역 feedback은 전체 '채점' 버튼 결과 요약용으로 남긴다.
  el.feedback.textContent='';
  el.feedback.className='feedback';
  persist();
  renderRetryDock();
  if(detail.status==='correct'){
    const next=nextAnswerField(field);
    if(next)setTimeout(()=>focusAnswerField(next,true),60);
    else schedulePracticalAutoAdvance();
  }
  return detail;
}
function installAnswerInputUX(){
  let tabNav=false;
  el.content.addEventListener('input',e=>{const field=answerField(e.target);if(!field)return;resizeAnswerField(field);field.classList.remove('retry-due');CL.storage.setDraft(state,field.dataset.fieldKey||'',field.value);clearFieldState(field);persist();});
  el.content.addEventListener('keydown',e=>{
    const field=answerField(e.target);if(!field)return;
    if(e.key==='Tab'){tabNav=true;setTimeout(()=>{const active=answerField(document.activeElement);if(active)active.scrollIntoView({block:'center',behavior:'smooth'});tabNav=false;},0);return;}
    if(e.key!=='Enter'||e.shiftKey||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
    if(e.isComposing||e.keyCode===229)return;
    if(state.ui.mode==='typing'){
      const task=currentTask();
      if(field.id==='typingInput'&&task?.type==='ki')return;
      e.preventDefault();
      const next=nextAnswerField(field);if(next)focusAnswerField(next,true);
      return;
    }
    if(state.ui.mode!=='cloze')return;
    e.preventDefault();gradeSingleAnswerField(field);
  });
  el.content.addEventListener('focusin',e=>{const field=answerField(e.target);if(field&&tabNav)setTimeout(()=>field.scrollIntoView({block:'center',behavior:'smooth'}),0);});
  el.content.addEventListener('click',e=>{const field=answerField(e.target);if(!field)return;if(field.dataset.firstClickSelectDone==='1')return;field.dataset.firstClickSelectDone='1';if(typeof field.select==='function')field.select();});
}

function clearFilledAnswers(){
  // '빈칸 비우기'는 사용자 요청에 따라 확인창 없이 즉시 실행한다.
  // 복습 일정·취약 통계·학습 범위는 변경하지 않는다.
  CL.storage.clearStudyInputs(state);revealed=false;render();persist();
}
function resetReviewData(){
  const ok=window.confirm('복습 데이터를 초기화할까요?\n오늘의 복습 일정, 취약 통계, 지연 재인출 카드가 모두 삭제됩니다.\n빈칸 입력값과 학습 범위/바퀴는 유지됩니다.');
  if(!ok)return;
  activeRetryCardId='';CL.storage.clearReviewData(state);CL.storage.save(state);renderRetryDock();renderReviewPage();
}
function changeScope(mutator){cancelPracticalAutoAdvance();saveAreaMemoNow();persist();mutator();syncFamilies(state.ui.family);state.ui.family=el.family.value;syncStages('whole');state.ui.stage='whole';if(el.stage)el.stage.value='whole';CL.storage.restoreScopeRound(state);rebuild(CL.storage.scopeTask(state));loadAreaMemo();updateMobileControlSummary();}
function filterChange(kind){
  const resetToFirst=kind==='area'&&el.area.value==='all';
  changeScope(()=>{
    if(kind==='subject'){state.ui.subject=el.subject.value;syncAreaOptions(state.ui.area);}
    if(kind==='area')state.ui.area=el.area.value;
  });
  if(resetToFirst&&engine.queue?.length){
    // 이전에 '전체 영역'에서 보던 위치가 아니라 항상 첫 영역의 첫 항목을 보여 준다.
    engine.goTo(0);
    revealed=false;
    render();
    persist();
  }
}
initSelectors();initMobileControlCollapse();initExamBrowser();state.ui.stage='whole';if(el.stage)el.stage.value='whole';CL.storage.restoreScopeRound(state);engine.rebuild(CL.storage.scopeTask(state));render();installAnswerInputUX();showMainTab(state.ui.mainTab||'study',false);renderRetryDock();loadAreaMemo();updateMobileControlSummary();
el.studyTab.onclick=()=>showMainTab('study');
el.reviewTab.onclick=()=>showMainTab('review');
el.examTab.onclick=()=>showMainTab('exam');
 document.getElementById('educationMainTab').onclick=()=>showMainTab('education');
if(el.examYear)el.examYear.onchange=()=>setExamFilter('year',el.examYear.value);
if(el.examPart)el.examPart.onchange=()=>setExamFilter('part',el.examPart.value);
if(el.examSubject)el.examSubject.onchange=()=>setExamFilter('subject',el.examSubject.value);
if(el.examTopic)el.examTopic.onchange=()=>setExamFilter('topic',el.examTopic.value);
if(el.examSolution)el.examSolution.onchange=()=>setExamFilter('solution',el.examSolution.value);
if(el.examSearch)el.examSearch.oninput=()=>setExamFilter('search',el.examSearch.value);
if(el.examReset)el.examReset.onclick=resetExamFilters;
el.examQuestionSelect?.addEventListener('change',()=>selectExamQuestion(el.examQuestionSelect.value));
el.examSheetButton?.addEventListener('click',openExamAnswerSheet);
el.examSheetClose?.addEventListener('click',()=>el.examSheetDialog?.close());
el.examSheetYear?.addEventListener('change',renderExamAnswerSheet);
el.examSheetPart?.addEventListener('change',renderExamAnswerSheet);
el.examDetail?.addEventListener('click',e=>{const nav=e.target.closest('[data-exam-nav]');if(nav?.dataset.examNav){selectExamQuestion(nav.dataset.examNav);return;}const panel=e.target.closest('.exam-solution-panel');if(e.target.closest('[data-exam-reveal]'))revealExamSolution(panel,true);else if(e.target.closest('[data-exam-hide]'))revealExamSolution(panel,false);});
el.prevArea?.addEventListener('click',()=>jumpArea(-1));
el.nextArea?.addEventListener('click',()=>jumpArea(1));
el.scrollTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
el.scrollBottom?.addEventListener('click',()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'smooth'}));

el.areaMemoTab?.addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  setAreaMemoOpen(!areaMemoOpen);
});
el.areaMemoClose?.addEventListener('click',e=>{e.preventDefault();setAreaMemoOpen(false);});
el.areaMemoText?.addEventListener('input',scheduleAreaMemoSave);
el.areaMemoText?.addEventListener('blur',saveAreaMemoNow);
el.areaMemoClear?.addEventListener('click',e=>{e.preventDefault();clearCurrentAreaMemo();});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&areaMemoOpen&&!e.isComposing)setAreaMemoOpen(false);
});
window.addEventListener('resize',()=>{answerFields().forEach(resizeAnswerField);});
el.hardMode?.addEventListener('click',toggleHardMode);
updateHardModeUI();
// 닫기 클릭은 채점 후에도 최우선 처리한다. 중첩 버튼·초점 이벤트와 충돌 방지.
el.retryDock.addEventListener('click',e=>{
  const close=e.target.closest('[data-retry-collapse]');
  if(!close)return;
  e.preventDefault();
  e.stopPropagation();
  collapseRetryCard(close.dataset.retryCollapse);
},true);
el.retryDock.addEventListener('click',e=>{
  const grade=e.target.closest('[data-retry-grade]');if(grade){gradeRetryCard(grade.dataset.retryGrade);return;}
  const later=e.target.closest('[data-retry-later]');if(later){deferRetryCard(later.dataset.retryLater);return;}
  const open=e.target.closest('[data-retry-open]');if(open){openRetryCard(open.dataset.retryOpen);}
});
el.retryDock.addEventListener('input',e=>{
  if(e.target.matches('input.retry-card-input'))sizeRetryInputs(e.target.closest('[data-retry-panel]'));
});
el.retryDock.addEventListener('keydown',e=>{
  if(pendingRetryAcknowledgment&&e.key==='Enter'&&!e.isComposing&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
    e.preventDefault();acknowledgeRetryCard(pendingRetryAcknowledgment.id);return;
  }
  const input=e.target.closest('.retry-card-input');if(!input||e.isComposing||e.keyCode===229)return;
  if(e.key!=='Enter'||e.shiftKey||e.ctrlKey||e.metaKey||e.altKey)return;
  const panel=input.closest('[data-retry-panel]');if(!panel)return;
  const fields=[...panel.querySelectorAll('.retry-card-input')],i=fields.indexOf(input);
  if(fields.length>1&&i<fields.length-1){e.preventDefault();fields[i+1].focus();return;}
  e.preventDefault();gradeRetryCard(panel.dataset.retryPanel);
});
document.addEventListener('pointerdown',e=>{
  if(!activeRetryCardId||!el.retryDock)return;
  if(el.retryDock.contains(e.target))return;
  // 바깥을 누르면 확인 절차 없이 카드만 접는다. 현재 정답/오답과 순서는 그대로.
  collapseRetryCard(activeRetryCardId);
},{capture:true});
document.addEventListener('pointerdown',e=>{
  if(!areaMemoOpen||!el.areaMemoShell)return;
  if(el.areaMemoShell.contains(e.target))return;
  setAreaMemoOpen(false);
},{capture:true});
el.reviewRetryList.addEventListener('click',e=>{const row=e.target.closest('[data-retry-id]');if(row){showMainTab('study');openRetryCard(row.dataset.retryId);}});
el.reviewWeakList.addEventListener('click',e=>{const row=e.target.closest('[data-line-id]');if(row)openWeakItem(row.dataset.lineId);});
el.dailyReviewList.addEventListener('click',e=>{
  const b=e.target.closest('[data-daily-grade]');
  if(b)gradeDailyReview(b.dataset.dailyGrade);
});
el.dailyReviewList.addEventListener('keydown',e=>{
  if(e.isComposing||e.keyCode===229||e.key!=='Enter'||e.shiftKey||e.ctrlKey||e.altKey||e.metaKey||e.repeat)return;
  const card=e.target.closest('[data-daily-review]');if(!card)return;
  const id=card.dataset.dailyReview;
  if(pendingDailyReviewGrades.has(id)){
    e.preventDefault();acknowledgeDailyReview(id);return;
  }
  const f=e.target.closest('.daily-review-input');if(!f)return;
  const fields=[...card.querySelectorAll('.daily-review-input')],i=fields.indexOf(f);
  if(fields.length>1&&i<fields.length-1){e.preventDefault();fields[i+1].focus();return;}
  e.preventDefault();gradeDailyReview(id);
});
el.clearAnswers.onclick=clearFilledAnswers;
el.resetReview.onclick=resetReviewData;
el.subject.onchange=()=>filterChange('subject');
el.area.onchange=()=>filterChange('area');
el.family.onchange=()=>changeScope(()=>{state.ui.family=el.family.value;});
if(el.stage)el.stage.onchange=()=>changeScope(()=>{state.ui.stage='whole';});
el.zoom.onchange=()=>{applyZoom();persist();};
el.retryReset?.addEventListener('click',()=>{
  const count=Object.keys(state.fieldRetries||{}).length;
  if(!count)return;
  if(!window.confirm(`누적 오답 카드 ${count}개를 모두 삭제할까요?\n복습 통계와 기존 학습 답안은 유지됩니다.`))return;
  retryPendingById.clear();
  pendingRetryAcknowledgment=null;
  activeRetryCardId='';
  state.fieldRetries={};
  state.fieldRetryCounts={};
  CL.storage.save(state);
  renderRetryDock();
  renderReviewPage();
});
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
el.check.onclick=check;el.reveal.onclick=fillAllClozeAnswers;
// 이전·다음·처음부터 버튼은 화면에서 제거됨. 구형 페이지와의 호환성만 유지.
if(el.next)el.next.onclick=()=>{cancelPracticalAutoAdvance();engine.next();revealed=false;render();};
if(el.prev)el.prev.onclick=()=>{cancelPracticalAutoAdvance();engine.prev();revealed=false;render();};
if(el.round)el.round.onclick=()=>{cancelPracticalAutoAdvance();engine.nextRound();revealed=false;render();};
el.source.onclick=sourceInfo;el.closeSource.onclick=()=>el.dialog.close();
window.addEventListener('pagehide',saveAreaMemoNow);
if(location.protocol!=='file:')window.addEventListener('load',async()=>{
  try{
    if('serviceWorker' in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.unregister()));
    }
    if('caches' in window){
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>k.startsWith('curriloop-')).map(k=>caches.delete(k)));
    }
  }catch(_){}
});
})();
