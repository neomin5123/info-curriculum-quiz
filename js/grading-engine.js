(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopGradingEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function normalize(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\s,.;:!?·ㆍ・∙‧⋅\-_/()\[\]{}'"“”‘’]+/g, '')
      .trim();
  }

  function oneEditApart(a, b) {
    const x = [...String(a || '')], y = [...String(b || '')];
    if (Math.abs(x.length - y.length) > 1) return false;
    if (x.join('') === y.join('')) return false;
    if (x.length === y.length) {
      let diff = 0;
      for (let i = 0; i < x.length; i++) if (x[i] !== y[i] && ++diff > 1) return false;
      return diff === 1;
    }
    const short = x.length < y.length ? x : y;
    const long = x.length < y.length ? y : x;
    let i = 0, j = 0, skipped = 0;
    while (i < short.length && j < long.length) {
      if (short[i] === long[j]) { i++; j++; continue; }
      if (++skipped > 1) return false;
      j++;
    }
    return true;
  }

  function classify(rawUser, expected, aliases = []) {
    const user = normalize(rawUser);
    if (!user) return 'wrong';
    const candidates = [expected, ...(aliases || [])].map(normalize).filter(Boolean);
    if (candidates.some(candidate => candidate === user)) return 'correct';
    if (user.length >= 6 && candidates.some(candidate => candidate.length >= 6 && oneEditApart(user, candidate))) return 'near';
    return 'wrong';
  }

  return {normalize, oneEditApart, classify};
});
