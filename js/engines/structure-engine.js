(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.StructureEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  "use strict";
  const CATEGORY_TITLES = ["지식·이해", "과정·기능", "가치·태도"];
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

  function buildDiscriminationQuestions(area, groups){
    const sections = groups?.["content-system"] || [];
    const questions = [];
    sections.forEach(section => {
      if (!CATEGORY_TITLES.includes(section.title)) return;
      (section.lines || []).forEach(line => {
        questions.push({
          id: `disc:${line.id || `${area}:${section.title}:${line.text}`}`,
          kind: "discriminate",
          area,
          prompt: line.text,
          answer: section.title,
          choices: CATEGORY_TITLES.slice(),
          sourceLineId: line.id || null
        });
      });
    });
    return questions;
  }

  function buildConnectionQuestions(area, groups){
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
      const distractors = standards
        .filter(line => line !== correct)
        .map(line => ({line, score: similarity(commentary.text, line.text)}))
        .sort((a,b) => b.score - a.score || String(a.line.id || a.line.text).localeCompare(String(b.line.id || b.line.text)))
        .slice(0, 3)
        .map(item => item.line);
      const choiceLines = stableShuffle([correct, ...distractors], `${commentary.id || commentary.text}:choices`);
      questions.push({
        id: `link:${commentary.id || `${area}:${code}`}`,
        kind: "connect",
        area,
        prompt: stripStandardCode(commentary.text),
        answer: correct.id || correct.text,
        answerCode: code,
        answerText: stripStandardCode(correct.text),
        choices: choiceLines.map(line => ({
          value: line.id || line.text,
          code: extractStandardCode(line.text),
          text: stripStandardCode(line.text)
        })),
        sourceLineId: commentary.id || null
      });
    });
    return questions;
  }

  function buildQuestionPool(curriculumData, area){
    const groups = curriculumData?.["middle-info"]?.[area];
    if (!groups) return [];
    return [
      ...buildDiscriminationQuestions(area, groups),
      ...buildConnectionQuestions(area, groups)
    ];
  }

  function buildSession(curriculumData, area, {limit = 8, nonce = 0} = {}){
    const pool = buildQuestionPool(curriculumData, area);
    const discriminate = stableShuffle(pool.filter(q => q.kind === "discriminate"), `${area}:disc:${nonce}`);
    const connect = stableShuffle(pool.filter(q => q.kind === "connect"), `${area}:link:${nonce}`);
    const picked = [];
    // 연결 문항은 적어도 1개, 가능한 경우 최대 절반까지 포함한다.
    const connectionTarget = Math.min(connect.length, Math.max(connect.length ? 1 : 0, Math.floor(limit / 2)));
    for (let i = 0; i < connectionTarget && picked.length < limit; i += 1) picked.push(connect[i]);
    let d = 0;
    while (picked.length < limit && d < discriminate.length) picked.push(discriminate[d++]);
    let c = connectionTarget;
    while (picked.length < limit && c < connect.length) picked.push(connect[c++]);
    return stableShuffle(picked, `${area}:session:${nonce}`).slice(0, limit);
  }

  return {
    CATEGORY_TITLES,
    extractStandardCode,
    stripStandardCode,
    similarity,
    buildQuestionPool,
    buildSession
  };
});
