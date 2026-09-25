(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CURRILOOP_GAP_INTENSITY = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';
  const profiles = Object.freeze({
    'value-attitude': Object.freeze({match:'가치·태도', minCore:1, maxCore:2, charsPerCore:40, practical:'free-keyword'}),
    'achievement-commentary': Object.freeze({match:'성취기준 해설', minCore:2, maxCore:4, charsPerCore:48, practical:'free-keyword'}),
    'achievement-consideration': Object.freeze({match:'성취기준 적용 시 고려', minCore:2, maxCore:4, charsPerCore:52, practical:'free-keyword'}),
    'core-idea': Object.freeze({match:'핵심 아이디어', minCore:1, maxCore:3, charsPerCore:28, practical:'free-keyword'}),
    'goal': Object.freeze({match:'목표', minCore:1, maxCore:4, charsPerCore:38, practical:'free-keyword'}),
    'keyword': Object.freeze({match:'__keyword__', minCore:1, maxCore:3, charsPerCore:48, practical:'free-keyword'}),
    'coreplus-default': Object.freeze({match:'__coreplus__', minCore:1, maxCore:4, charsPerCore:44, practical:'free-keyword'})
  });
  return Object.freeze({
    version:1,
    principle:'공식 원문과 6,245개 gap inventory는 유지하고, 핵심 빈칸 노출량과 통회상 형식만 학습용 metadata에서 제어한다.',
    profiles
  });
});
