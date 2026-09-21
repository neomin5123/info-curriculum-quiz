(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.StructureEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  "use strict";

  // 중등 정보 구조 연습은 자명한 '범주 맞히기'를 제거하고,
  // 성취기준-내용체계-해설 사이의 실제 연결을 회상하도록 제한한다.
  // 아래 매핑은 2022 개정 중학교 정보 내용체계와 성취기준을 사람이 검토해
  // 직접 연결이 명확한 경우만 기록한 CurriLoop 학습용 메타데이터다.
  const CURATED_ELEMENT_LINKS = {
    "컴퓨팅 시스템": [
      {sourceId:"MI-01-CS-KN-01", codes:["9정01-01"]},
      {sourceId:"MI-01-CS-KN-02", codes:["9정01-01"]},
      {sourceId:"MI-01-CS-KN-03", codes:["9정01-02"]},
      {sourceId:"MI-01-CS-PF-01", codes:["9정01-01"]},
      {sourceId:"MI-01-CS-PF-02", codes:["9정01-02"]},
      {sourceId:"MI-01-CS-PF-03", codes:["9정01-03"]},
      {sourceId:"MI-01-CS-VA-01", codes:["9정01-02"]},
      {sourceId:"MI-01-CS-VA-02", codes:["9정01-03"]}
    ],
    "데이터": [
      {sourceId:"MI-02-CS-KN-01", codes:["9정02-01"]},
      {sourceId:"MI-02-CS-KN-02", codes:["9정02-02"]},
      {sourceId:"MI-02-CS-KN-03", codes:["9정02-03","9정02-04"]},
      {sourceId:"MI-02-CS-PF-01", codes:["9정02-01"]},
      {sourceId:"MI-02-CS-PF-02", codes:["9정02-02"]},
      {sourceId:"MI-02-CS-PF-03", codes:["9정02-03","9정02-04"]},
      {sourceId:"MI-02-CS-VA-01", codes:["9정02-01"]},
      {sourceId:"MI-02-CS-VA-02", codes:["9정02-04"]}
    ],
    "알고리즘과 프로그래밍": [
      {sourceId:"MI-03-CS-KN-01", codes:["9정03-01","9정03-02"]},
      {sourceId:"MI-03-CS-KN-02", codes:["9정03-02"]},
      {sourceId:"MI-03-CS-KN-03", codes:["9정03-05"]},
      {sourceId:"MI-03-CS-KN-04", codes:["9정03-06"]},
      {sourceId:"MI-03-CS-KN-05", codes:["9정03-06"]},
      {sourceId:"MI-03-CS-KN-06", codes:["9정03-07"]},
      {sourceId:"MI-03-CS-PF-01", codes:["9정03-01"]},
      {sourceId:"MI-03-CS-PF-02", codes:["9정03-03","9정03-04"]},
      {sourceId:"MI-03-CS-PF-03", codes:["9정03-05","9정03-06"]},
      {sourceId:"MI-03-CS-PF-04", codes:["9정03-07"]},
      {sourceId:"MI-03-CS-VA-03", codes:["9정03-09"]}
    ],
    "인공지능": [
      {sourceId:"MI-04-CS-KN-01", codes:["9정04-01"]},
      {sourceId:"MI-04-CS-PF-01", codes:["9정04-01"]},
      {sourceId:"MI-04-CS-PF-02", codes:["9정04-02","9정04-03"]},
      {sourceId:"MI-04-CS-PF-03", codes:["9정04-04"]},
      {sourceId:"MI-04-CS-PF-04", codes:["9정04-04"]},
      {sourceId:"MI-04-CS-VA-01", codes:["9정04-04"]},
      {sourceId:"MI-04-CS-VA-02", codes:["9정04-05"]}
    ],
    "디지털 문화": [
      {sourceId:"MI-05-CS-KN-01", codes:["9정05-01"]},
      {sourceId:"MI-05-CS-KN-02", codes:["9정05-02"]},
      {sourceId:"MI-05-CS-KN-03", codes:["9정05-03"]},
      {sourceId:"MI-05-CS-PF-01", codes:["9정05-01"]},
      {sourceId:"MI-05-CS-PF-02", codes:["9정05-02"]},
      {sourceId:"MI-05-CS-PF-03", codes:["9정05-03"]},
      {sourceId:"MI-05-CS-VA-01", codes:["9정05-01"]}
    ]
  };

  const GENERIC_TOKENS = new Set([
    "이해하고","이해한다","활용하여","활용한다","문제를","문제","해결","해결한다","통해","위해","대한","있는","있도록",
    "한다","하고","한다.","수","있어야","사례를","중심으로","다양한","적합한","과정에서","과정을","바탕으로","구성하고"
  ]);

  function extractStandardCode(text){
    const match = String(text || "").match(/^\s*\[([^\]]+)\]/);
    return match ? match[1].trim() : "";
  }

  function stripStandardCode(text){
    return String(text || "").replace(/^\s*\[[^\]]+\]\s*/, "").trim();
  }

  function tokenize(text){
    return stripStandardCode(text)
      .replace(/[·,./()'"“”‘’!?;:]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map(token => token.replace(/(을|를|이|가|은|는|의|에|에서|으로|와|과|하고|하여|한다|한다\.)$/g, ""))
      .filter(token => token.length >= 2 && !GENERIC_TOKENS.has(token));
  }

  function similarity(a, b){
    const aa = new Set(tokenize(a));
    const bb = new Set(tokenize(b));
    if (!aa.size || !bb.size) return 0;
    let intersection = 0;
    aa.forEach(token => { if (bb.has(token)) intersection += 1; });
    const union = new Set([...aa, ...bb]).size;
    return union ? intersection / union : 0;
  }

  function stableShuffle(items, seedText){
    const out = items.slice();
    let seed = 2166136261;
    for (const ch of String(seedText || "")) {
      seed ^= ch.charCodeAt(0);
      seed = Math.imul(seed, 16777619) >>> 0;
    }
    function rand(){
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function findLineById(groups, sourceId){
    for (const sections of Object.values(groups || {})) {
      if (!Array.isArray(sections)) continue;
      for (const section of sections) {
        const line = (section.lines || []).find(item => item.id === sourceId);
        if (line) return {line, section};
      }
    }
    return null;
  }

  function buildStandardIndex(groups){
    const achievementSections = groups?.achievement || [];
    const standards = achievementSections.find(section => section.title === "성취기준")?.lines || [];
    const byCode = new Map();
    standards.forEach(line => {
      const code = extractStandardCode(line.text);
      if (code) byCode.set(code, line);
    });
    return {standards, byCode};
  }

  function buildStandardElementQuestions(area, groups){
    const curated = CURATED_ELEMENT_LINKS[area] || [];
    const {standards} = buildStandardIndex(groups);
    const sourceMap = new Map();
    curated.forEach(mapping => {
      const found = findLineById(groups, mapping.sourceId);
      if (found) sourceMap.set(mapping.sourceId, found);
    });
    const uniqueSources = [...sourceMap.entries()].map(([sourceId, found]) => ({sourceId, ...found}));
    const questions = [];

    standards.forEach(standard => {
      const code = extractStandardCode(standard.text);
      const linkedIds = curated.filter(mapping => mapping.codes.includes(code)).map(mapping => mapping.sourceId).filter(id => sourceMap.has(id));
      if (!linkedIds.length) return;
      const linkedSet = new Set(linkedIds);
      const correctChoices = linkedIds.map(sourceId => {
        const found = sourceMap.get(sourceId);
        return {value:sourceId, text:`${found.section.title} · ${found.line.text}`, category:found.section.title};
      });
      const distractors = uniqueSources
        .filter(item => !linkedSet.has(item.sourceId))
        .map(item => ({...item, score:similarity(standard.text, item.line.text)}))
        .sort((a,b) => b.score - a.score || a.sourceId.localeCompare(b.sourceId))
        .slice(0, Math.max(0, 6 - correctChoices.length))
        .map(item => ({value:item.sourceId, text:`${item.section.title} · ${item.line.text}`, category:item.section.title}));
      const choices = stableShuffle([...correctChoices, ...distractors], `${area}:${code}:elements`);
      questions.push({
        id:`standard-elements:${area}:${code}`,
        kind:"standard-elements",
        area,
        prompt:stripStandardCode(standard.text),
        answerCode:code,
        answers:linkedIds,
        answerElements:correctChoices.map(choice => choice.text),
        choices,
        multiSelect:true,
        sourceLineId:standard.id || null
      });
    });
    return questions;
  }

  function compactStandardChoices(standards, correct, prompt, seedText){
    const distractors = standards
      .filter(line => line !== correct)
      .map(line => ({line, score:similarity(prompt, line.text)}))
      .sort((a,b) => b.score - a.score || String(a.line.id || a.line.text).localeCompare(String(b.line.id || b.line.text)))
      .slice(0, 3)
      .map(item => item.line);
    return stableShuffle([correct, ...distractors], seedText).map(line => ({
      value:line.id || line.text,
      code:extractStandardCode(line.text),
      text:stripStandardCode(line.text)
    }));
  }

  function buildCommentaryConnectionQuestions(area, groups){
    const achievementSections = groups?.achievement || [];
    const standards = achievementSections.find(section => section.title === "성취기준")?.lines || [];
    const commentaries = achievementSections.find(section => section.title === "성취기준 해설")?.lines || [];
    const standardsByCode = new Map();
    standards.forEach(line => {
      const code = extractStandardCode(line.text);
      if (code) standardsByCode.set(code, line);
    });
    const questions = [];
    commentaries.forEach(commentary => {
      const code = extractStandardCode(commentary.text);
      const correct = standardsByCode.get(code);
      if (!correct) return;
      questions.push({
        id:`commentary-link:${commentary.id || `${area}:${code}`}`,
        kind:"commentary-connect",
        area,
        prompt:stripStandardCode(commentary.text),
        answer:correct.id || correct.text,
        answerCode:code,
        answerText:stripStandardCode(correct.text),
        choices:compactStandardChoices(standards, correct, commentary.text, `${commentary.id || commentary.text}:choices`),
        multiSelect:false,
        sourceLineId:commentary.id || null
      });
    });
    return questions;
  }

  function buildQuestionPool(curriculumData, area){
    const groups = curriculumData?.["middle-info"]?.[area];
    if (!groups) return [];
    return [
      ...buildStandardElementQuestions(area, groups),
      ...buildCommentaryConnectionQuestions(area, groups)
    ];
  }

  function buildSession(curriculumData, area, {limit = 6, nonce = 0} = {}){
    const pool = buildQuestionPool(curriculumData, area);
    const standardLinks = stableShuffle(pool.filter(q => q.kind === "standard-elements"), `${area}:standard-elements:${nonce}`);
    const commentaryLinks = stableShuffle(pool.filter(q => q.kind === "commentary-connect"), `${area}:commentary:${nonce}`);
    const picked = [];
    const commentaryTarget = Math.min(commentaryLinks.length, 2, Math.max(commentaryLinks.length ? 1 : 0, Math.floor(limit / 3)));
    for (let i = 0; i < commentaryTarget && picked.length < limit; i += 1) picked.push(commentaryLinks[i]);
    let s = 0;
    while (picked.length < limit && s < standardLinks.length) picked.push(standardLinks[s++]);
    let c = commentaryTarget;
    while (picked.length < limit && c < commentaryLinks.length) picked.push(commentaryLinks[c++]);
    return stableShuffle(picked, `${area}:session:${nonce}`).slice(0, limit);
  }

  return {
    CURATED_ELEMENT_LINKS,
    extractStandardCode,
    stripStandardCode,
    similarity,
    buildQuestionPool,
    buildSession
  };
});
