(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopGradingEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const PARTICLES = [
    '으로부터','에게서','한테서','으로써','으로서','에서부터','에게','한테','께서','으로','까지','부터','보다','처럼','같이','마다','조차','마저','밖에','라도','이나','든지','든','만','도','은','는','이','가','을','를','의','에','와','과','로'
  ].sort((a, b) => b.length - a.length);

  // 임용 원문에서는 정확한 공식 표현을 다시 확인해야 하므로 아래 표현들은 ‘정답’으로 승격하지 않고
  // 의미가 가까운 경우에만 near(유예)로 판정한다. 사용자 오답에서 반복된 패턴을 일반화한 규칙이다.
  const SEMANTIC_GROUPS = [
    ['특성','특징'],
    ['구별','구분'],
    ['발전','발달'],
    ['주의','유의'],
    ['활용','사용']
  ];

  const SEMANTIC_MAP = (() => {
    const map = new Map();
    SEMANTIC_GROUPS.forEach(group => group.forEach(term => map.set(term, group[0])));
    return map;
  })();

  const PHRASE_EQUIVALENTS = [
    ['생활속', '실생활', '일상생활'],
    ['디지털세상', '디지털사회']
  ];

  // 임용 답안에서 서로 바뀌면 의미 단계가 달라지는 핵심 행동어.
  // 한쪽이 이런 행동어를 쓰고 다른 쪽이 다른/없는 행동어라면 단순 유사어로 유예하지 않는다.
  const STRICT_ACTION_TERMS = [
    '시뮬레이션','모델링','구조화','프로그래밍','분석','비교','설계','구현','평가','선택','탐색','발견','추출','표현','수집','가공','분류','처리','개발','검증','예측','학습','해결','적용','판단','설명','추론'
  ].sort((a,b) => b.length - a.length);

  function strictActionSet(value) {
    const source = normalize(value);
    const found = new Set();
    STRICT_ACTION_TERMS.forEach(term => { if (source.includes(term)) found.add(term); });
    return found;
  }

  function strictActionConflict(a, b) {
    const aa = strictActionSet(a), bb = strictActionSet(b);
    if (!aa.size || !bb.size) return false;
    if (aa.size !== bb.size) return true;
    for (const term of aa) if (!bb.has(term)) return true;
    return false;
  }

  function normalize(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\s,.;:!?·ㆍ・∙‧⋅\-_/()\[\]{}'"“”‘’]+/g, '')
      .trim();
  }

  function words(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[,.;:!?·ㆍ・∙‧⋅\-_/()\[\]{}'"“”‘’]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean);
  }

  function stripParticle(word) {
    const source = String(word || '');
    for (const particle of PARTICLES) {
      if (source.endsWith(particle) && source.length - particle.length >= 2) {
        return source.slice(0, -particle.length);
      }
    }
    return source;
  }

  function particleTokenEquivalent(a, b) {
    if (a === b) return true;
    for (const particle of PARTICLES) {
      if ((a === b + particle && b.length >= 2) || (b === a + particle && a.length >= 2)) return true;
    }
    return false;
  }

  function particleEquivalent(a, b) {
    const wa = words(a), wb = words(b);
    if (!wa.length || wa.length !== wb.length) return false;
    return wa.every((token, index) => particleTokenEquivalent(token, wb[index]));
  }

  function particleNormalized(value) {
    // 외부 호환용. 실제 판정은 동사 어미를 조사로 잘못 제거하지 않도록 particleEquivalent를 사용한다.
    return words(value).map(stripParticle).join('');
  }

  function preprocessSemanticPhrases(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/생활\s*속/g, '실생활')
      .replace(/일상생활/g, '실생활')
      .replace(/디지털\s*세상/g, '디지털 사회');
  }

  function canonicalizeSemanticToken(token) {
    let result = String(token || '');
    const suffixPattern = /^(?:하|해|했|해야|할|함|되|된|되는|되어|될|을|를|이|가|은|는|의|에|에서|로|으로|과|와|도)/;
    for (const [term, canonical] of SEMANTIC_MAP.entries()) {
      if (!result.startsWith(term)) continue;
      const suffix = result.slice(term.length);
      if (!suffix || suffixPattern.test(suffix)) result = canonical + suffix;
    }
    result = result
      .replace(/찾아내는/g, '찾는')
      .replace(/찾아내기/g, '찾기')
      .replace(/찾아낸/g, '찾은')
      .replace(/찾아내/g, '찾')
      // 같은 어간의 활용형 차이는 의미 오답이 아니라 공식 표기 재확인 대상으로 본다.
      .replace(/되는$/g, '된')
      .replace(/되어$/g, '된')
      .replace(/하는$/g, '한');
    return result;
  }

  function semanticWords(value) {
    return words(preprocessSemanticPhrases(value)).map(canonicalizeSemanticToken);
  }

  function semanticCanonical(value) {
    return semanticWords(value).join('');
  }

  function semanticParticleEquivalent(a, b) {
    const wa = semanticWords(a), wb = semanticWords(b);
    if (!wa.length || wa.length !== wb.length) return false;
    return wa.every((token, index) => particleTokenEquivalent(token, wb[index]));
  }

  function levenshtein(a, b) {
    const x = [...String(a || '')], y = [...String(b || '')];
    if (!x.length) return y.length;
    if (!y.length) return x.length;
    const prev = Array(y.length + 1).fill(0).map((_, i) => i);
    for (let i = 1; i <= x.length; i++) {
      let left = i;
      let diag = i - 1;
      for (let j = 1; j <= y.length; j++) {
        const up = prev[j];
        const cost = x[i - 1] === y[j - 1] ? 0 : 1;
        const next = Math.min(up + 1, left + 1, diag + cost);
        diag = up;
        prev[j] = next;
        left = next;
      }
      prev[0] = i;
    }
    return prev[y.length];
  }

  function oneEditApart(a, b) {
    const x = String(a || ''), y = String(b || '');
    return x !== y && levenshtein(x, y) === 1;
  }

  function decomposeHangul(value) {
    const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
    const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
    const JONG = ['', 'ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
    const out = [];
    for (const char of String(value || '')) {
      const code = char.charCodeAt(0);
      if (code < 0xAC00 || code > 0xD7A3) { out.push(char); continue; }
      const n = code - 0xAC00;
      const cho = Math.floor(n / 588);
      const jung = Math.floor((n % 588) / 28);
      const jong = n % 28;
      out.push(CHO[cho], JUNG[jung]);
      if (jong) out.push(JONG[jong]);
    }
    return out.join('');
  }

  function likelyTypo(a, b) {
    const x = normalize(a), y = normalize(b);
    if (!x || !y || x === y) return false;
    const maxLen = Math.max([...x].length, [...y].length);
    const charDistance = levenshtein(x, y);
    if (maxLen >= 5 && charDistance <= 1) return true;
    const jx = decomposeHangul(x), jy = decomposeHangul(y);
    const jamoDistance = levenshtein(jx, jy);
    // 짧은 공식 용어는 한 음절 차이가 개념 차이일 수 있으므로, 자모 수준 한 번의 오타일 때만 허용한다.
    if (maxLen <= 4 && jamoDistance <= 1) return true;
    if (maxLen >= 5) {
      const similarity = 1 - charDistance / maxLen;
      if (similarity >= 0.88) return true;
    }
    return false;
  }

  function strongPartialMatch(a, b) {
    const x = normalize(a), y = normalize(b);
    if (!x || !y || x === y) return false;
    const short = x.length <= y.length ? x : y;
    const long = x.length <= y.length ? y : x;
    if (short.length < 2 || !long.includes(short)) return false;
    const coverage = short.length / long.length;
    // ‘문제’처럼 지나치게 짧고 일반적인 조각은 부분 정답으로 보지 않는다.
    if (short.length <= 2 && coverage < 0.5) return false;
    return coverage >= 0.5;
  }

  function strongTokenOverlap(a, b) {
    const wa = words(a).map(stripParticle).filter(w => w.length >= 2);
    const wb = words(b).map(stripParticle).filter(w => w.length >= 2);
    if (wa.length < 2 || wb.length < 2) return false;
    const sa = new Set(wa), sb = new Set(wb);
    let shared = 0;
    sa.forEach(token => { if (sb.has(token)) shared += 1; });
    if (shared < 2) return false;
    const ratio = shared / Math.max(sa.size, sb.size);
    return ratio >= 2 / 3;
  }

  function reasonLabel(reason) {
    return ({
      particle: '조사 차이',
      synonym: '유사 표현',
      typo: '오타 가능',
      partial: '부분 일치',
      overlap: '표현 일부 일치',
      similar: '표기 유사'
    })[reason] || '유사 답안';
  }

  function compareNear(rawUser, candidate) {
    const user = normalize(rawUser);
    const expected = normalize(candidate);
    if (!user || !expected || user === expected) return null;

    if (particleEquivalent(rawUser, candidate)) return {reason:'particle', confidence:0.99};
    if (likelyTypo(rawUser, candidate)) return {reason:'typo', confidence:0.94};
    if (strictActionConflict(rawUser, candidate)) return null;

    const semanticUser = semanticCanonical(rawUser);
    const semanticExpected = semanticCanonical(candidate);
    if (semanticUser && semanticUser === semanticExpected) return {reason:'synonym', confidence:0.95};
    if (semanticParticleEquivalent(rawUser, candidate)) return {reason:'synonym', confidence:0.94};

    if (strongPartialMatch(semanticUser, semanticExpected)) return {reason:'partial', confidence:0.86};
    // 단어 2개가 겹친다는 이유만으로 핵심 술어가 바뀐 문장을 유예하지 않는다.
    // (예: 구성되는 컴퓨팅 시스템 ↔ 동작하는 컴퓨팅 시스템)

    const maxLen = Math.max(user.length, expected.length);
    const similarity = maxLen ? 1 - levenshtein(user, expected) / maxLen : 0;
    if (maxLen >= 6 && similarity >= 0.82) return {reason:'similar', confidence:similarity};
    return null;
  }

  function classifyDetailed(rawUser, expected, aliases = []) {
    const user = normalize(rawUser);
    if (!user) return {status:'unknown', reason:'empty', confidence:1, matched:''};
    const candidates = [expected, ...(aliases || [])].filter(value => String(value || '').trim());
    for (const candidate of candidates) {
      if (normalize(candidate) === user) return {status:'correct', reason:'exact', confidence:1, matched:candidate};
    }

    let best = null;
    for (const candidate of candidates) {
      const near = compareNear(rawUser, candidate);
      if (!near) continue;
      const scored = {...near, status:'near', matched:candidate};
      if (!best || scored.confidence > best.confidence) best = scored;
    }
    return best || {status:'wrong', reason:'meaning', confidence:1, matched:String(expected || '')};
  }

  function classify(rawUser, expected, aliases = []) {
    return classifyDetailed(rawUser, expected, aliases).status;
  }

  return {
    normalize,
    words,
    stripParticle,
    particleNormalized,
    particleEquivalent,
    semanticCanonical,
    semanticParticleEquivalent,
    levenshtein,
    oneEditApart,
    decomposeHangul,
    likelyTypo,
    strongPartialMatch,
    strongTokenOverlap,
    strictActionSet,
    strictActionConflict,
    reasonLabel,
    classifyDetailed,
    classify
  };
});
