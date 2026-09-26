(function(root, factory) {
  const config = (typeof module === 'object' && module.exports)
    ? require('../../data/learning-aids/gap-intensity.js')
    : root?.CURRILOOP_GAP_INTENSITY;
  const api = factory(config);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopIntensityEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(Config) {
  'use strict';

  const profiles = Config?.profiles || {};
  const lineOverrides = Config?.lineOverrides || {};
  function cleanBody(text) {
    return String(text || '').replace(/^\[[^\]]+\]\s*/, '').trim();
  }

  function profileFor(sectionTitle, sourceGroup = '', tierKey = 'coreplus') {
    const title = String(sectionTitle || '').trim();
    if (title === '가치·태도') return profiles['value-attitude'];
    if (title.includes('성취기준 해설')) return profiles['achievement-commentary'];
    if (title.includes('성취기준 적용 시 고려')) return profiles['achievement-consideration'];
    if (title === '핵심 아이디어') return profiles['core-idea'];
    if (title === '목표') return profiles.goal;
    if (tierKey === 'keyword' || sourceGroup === 'teaching-evaluation' || title === '성격' || /교수|평가/.test(title)) return profiles.keyword;
    return profiles['coreplus-default'];
  }

  function targetCount(line, sectionTitle, sourceGroup = '', tierKey = 'coreplus', availableCount = null) {
    const count = availableCount == null ? Number(line?.easy?.length || 0) : Number(availableCount || 0);
    if (count <= 0) return 0;
    const profile = profileFor(sectionTitle, sourceGroup, tierKey) || {minCore:1,maxCore:count,charsPerCore:44};
    const len = cleanBody(line?.text).length;
    const densityTarget = Math.max(1, Math.ceil(len / Math.max(1, Number(profile.charsPerCore || 44))));
    const desired = Math.max(Number(profile.minCore || 1), Math.min(Number(profile.maxCore || count), densityTarget));
    return Math.max(1, Math.min(count, desired));
  }

  function selectDistributed(entries, text, wanted) {
    const source = String(text || '');
    const list = (entries || []).map((entry, index) => ({
      ...entry,
      _sourceIndex:index,
      _pos:Math.max(0, source.indexOf(String(entry?.answer || '')))
    })).sort((a,b) => a._pos - b._pos || String(b.answer || '').length - String(a.answer || '').length || a._sourceIndex - b._sourceIndex);
    const n = Math.max(0, Math.min(list.length, Number(wanted || 0)));
    if (!n) return [];
    if (n >= list.length) return list.map(({_sourceIndex,_pos,...entry}) => entry);
    if (n === 1) {
      const chosen = [...list].sort((a,b) => String(b.answer || '').length - String(a.answer || '').length || a._pos - b._pos)[0];
      const {_sourceIndex,_pos,...entry} = chosen;
      return [entry];
    }
    const picks = [];
    const used = new Set();
    for (let i=0;i<n;i++) {
      const rawIndex = Math.round(i * (list.length - 1) / (n - 1));
      let index = rawIndex;
      while (used.has(index) && index + 1 < list.length) index++;
      while (used.has(index) && index - 1 >= 0) index--;
      if (!used.has(index)) { used.add(index); picks.push(list[index]); }
    }
    return picks.sort((a,b) => a._pos - b._pos).map(({_sourceIndex,_pos,...entry}) => entry);
  }

  function selectCoreEntries(line, entries, sectionTitle, sourceGroup = '', tierKey = 'coreplus') {
    const source = Array.isArray(entries) ? entries : [];
    if (!source.length) return [];
    if (tierKey === 'exact') return source.slice();
    const override = lineOverrides[String(line?.id || '')];
    if (Array.isArray(override) && override.length) {
      const wanted = new Set(override.map(String));
      return source.filter(entry => wanted.has(String(entry?.answer || '')));
    }
    const wanted = targetCount(line, sectionTitle, sourceGroup, tierKey, source.length);
    return selectDistributed(source, line?.text || '', wanted);
  }

  function hiddenCoverage(text, entries) {
    const source = String(text || '');
    if (!source) return 0;
    const spans=[];
    for (const entry of entries || []) {
      const answer=String(entry?.answer || '');
      if (!answer) continue;
      let from=0;
      while (from < source.length) {
        const index=source.indexOf(answer,from);
        if (index<0) break;
        spans.push([index,index+answer.length]);
        from=index+answer.length;
      }
    }
    spans.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    const merged=[];
    for(const span of spans){
      const last=merged[merged.length-1];
      if(!last || span[0]>=last[1]) merged.push(span.slice());
      else last[1]=Math.max(last[1],span[1]);
    }
    const covered=merged.reduce((sum,span)=>sum+span[1]-span[0],0);
    return covered/source.length;
  }

  return { profileFor, targetCount, selectDistributed, selectCoreEntries, hiddenCoverage, lineOverrides };
});
