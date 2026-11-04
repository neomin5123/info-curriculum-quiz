(function(){
  'use strict';
  const CL=window.CurriLoop=window.CurriLoop||{};

  const PARTICLES=['으로부터','에게서','한테서','으로써','으로서','에서부터','에게','한테','께서','으로','까지','부터','보다','처럼','같이','마다','조차','마저','밖에','라도','이나','든지','든','만','도','은','는','이','가','을','를','의','에','와','과','로'].sort((a,b)=>b.length-a.length);
  const SEMANTIC_GROUPS=[['특성','특징'],['구별','구분'],['발전','발달'],['주의','유의'],['활용','사용']];
  const SEMANTIC_MAP=(()=>{const m=new Map();SEMANTIC_GROUPS.forEach(g=>g.forEach(t=>m.set(t,g[0])));return m;})();
  const STRICT_ACTION_TERMS=['시뮬레이션','모델링','구조화','프로그래밍','분석','비교','설계','구현','평가','선택','탐색','발견','추출','표현','수집','가공','분류','처리','개발','검증','예측','학습','해결','적용','판단','설명','추론'].sort((a,b)=>b.length-a.length);

  function norm(value){return String(value||'').normalize('NFKC').toLowerCase().replace(/[\s,.;:!?·ㆍ・∙‧⋅\-_/()\[\]{}'"“”‘’<>，。]+/g,'').trim();}
  function exact(a,b){return norm(a)===norm(b);}
  function words(value){return String(value||'').normalize('NFKC').toLowerCase().replace(/[,.;:!?·ㆍ・∙‧⋅\-_/()\[\]{}'"“”‘’<>，。]+/g,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);}
  function stripParticle(word){const s=String(word||'');for(const p of PARTICLES){if(s.endsWith(p)&&s.length-p.length>=2)return s.slice(0,-p.length);}return s;}
  function particleTokenEquivalent(a,b){if(a===b)return true;for(const p of PARTICLES){if((a===b+p&&b.length>=2)||(b===a+p&&a.length>=2))return true;}return false;}
  function particleEquivalent(a,b){const wa=words(a),wb=words(b);return !!wa.length&&wa.length===wb.length&&wa.every((t,i)=>particleTokenEquivalent(t,wb[i]));}
  function preprocessSemanticPhrases(v){return String(v||'').normalize('NFKC').toLowerCase().replace(/생활\s*속/g,'실생활').replace(/일상생활/g,'실생활').replace(/디지털\s*세상/g,'디지털 사회');}
  function canonicalizeSemanticToken(token){let r=String(token||'');const suffix=/^(?:하|해|했|해야|할|함|되|된|되는|되어|될|을|를|이|가|은|는|의|에|에서|로|으로|과|와|도)/;for(const [term,canonical] of SEMANTIC_MAP.entries()){if(!r.startsWith(term))continue;const tail=r.slice(term.length);if(!tail||suffix.test(tail))r=canonical+tail;}return r.replace(/찾아내는/g,'찾는').replace(/찾아내기/g,'찾기').replace(/찾아낸/g,'찾은').replace(/찾아내/g,'찾').replace(/되는$/g,'된').replace(/되어$/g,'된').replace(/하는$/g,'한');}
  function semanticWords(v){return words(preprocessSemanticPhrases(v)).map(canonicalizeSemanticToken);}
  function semanticCanonical(v){return semanticWords(v).join('');}
  function semanticParticleEquivalent(a,b){const wa=semanticWords(a),wb=semanticWords(b);return !!wa.length&&wa.length===wb.length&&wa.every((t,i)=>particleTokenEquivalent(t,wb[i]));}
  function strictActionSet(v){const s=norm(v),found=new Set();STRICT_ACTION_TERMS.forEach(t=>{if(s.includes(t))found.add(t);});return found;}
  function strictActionConflict(a,b){const aa=strictActionSet(a),bb=strictActionSet(b);if(!aa.size||!bb.size)return false;if(aa.size!==bb.size)return true;for(const t of aa)if(!bb.has(t))return true;return false;}
  function levenshtein(a,b){const x=[...String(a||'')],y=[...String(b||'')];if(!x.length)return y.length;if(!y.length)return x.length;const prev=Array.from({length:y.length+1},(_,i)=>i);for(let i=1;i<=x.length;i++){let left=i,diag=i-1;for(let j=1;j<=y.length;j++){const up=prev[j],cost=x[i-1]===y[j-1]?0:1,next=Math.min(up+1,left+1,diag+cost);diag=up;prev[j]=next;left=next;}prev[0]=i;}return prev[y.length];}
  function decomposeHangul(v){const CHO=['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'],JUNG=['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'],JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'],out=[];for(const ch of String(v||'')){const code=ch.charCodeAt(0);if(code<0xAC00||code>0xD7A3){out.push(ch);continue;}const n=code-0xAC00,cho=Math.floor(n/588),jung=Math.floor((n%588)/28),jong=n%28;out.push(CHO[cho],JUNG[jung]);if(jong)out.push(JONG[jong]);}return out.join('');}
  function likelyTypo(a,b){const x=norm(a),y=norm(b);if(!x||!y||x===y)return false;const maxLen=Math.max([...x].length,[...y].length),charDistance=levenshtein(x,y);if(maxLen>=5&&charDistance<=1)return true;const jd=levenshtein(decomposeHangul(x),decomposeHangul(y));if(maxLen<=4&&jd<=1)return true;if(maxLen>=5&&(1-charDistance/maxLen)>=.88)return true;return false;}
  function strongPartialMatch(a,b){const x=norm(a),y=norm(b);if(!x||!y||x===y)return false;const short=x.length<=y.length?x:y,long=x.length<=y.length?y:x;if(short.length<2||!long.includes(short))return false;const coverage=short.length/long.length;if(short.length<=2&&coverage<.5)return false;return coverage>=.5;}
  function reasonLabel(reason){return ({particle:'조사 차이',synonym:'유사 표현',typo:'오타 가능',partial:'부분 일치',similar:'표기 유사',empty:'미입력',meaning:'의미 불일치',duplicate:'중복'})[reason]||'표기 확인';}
  function compareNear(rawUser,candidate){const user=norm(rawUser),expected=norm(candidate);if(!user||!expected||user===expected)return null;if(particleEquivalent(rawUser,candidate))return {reason:'particle',confidence:.99};if(likelyTypo(rawUser,candidate))return {reason:'typo',confidence:.94};if(strictActionConflict(rawUser,candidate))return null;const su=semanticCanonical(rawUser),se=semanticCanonical(candidate);if(su&&su===se)return {reason:'synonym',confidence:.95};if(semanticParticleEquivalent(rawUser,candidate))return {reason:'synonym',confidence:.94};if(strongPartialMatch(su,se))return {reason:'partial',confidence:.86};const ml=Math.max(user.length,expected.length),sim=ml?1-levenshtein(user,expected)/ml:0;if(ml>=6&&sim>=.82)return {reason:'similar',confidence:sim};return null;}
  function classifyDetailed(rawUser,expected,aliases=[]){const user=norm(rawUser);if(!user)return {status:'unknown',reason:'empty',confidence:1,matched:'',expected:String(expected||'')};const candidates=[expected,...(aliases||[])].filter(v=>String(v||'').trim());for(const c of candidates)if(norm(c)===user)return {status:'correct',reason:'exact',confidence:1,matched:c,expected:String(expected||'')};let best=null;for(const c of candidates){const near=compareNear(rawUser,c);if(!near)continue;const scored={...near,status:'near',matched:c,expected:String(expected||'')};if(!best||scored.confidence>best.confidence)best=scored;}return best||{status:'wrong',reason:'meaning',confidence:1,matched:'',expected:String(expected||'')};}
  function classify(rawUser,expected,aliases=[]){return classifyDetailed(rawUser,expected,aliases).status;}
  function severity(status){return ({correct:0,near:1,unknown:2,wrong:3,duplicate:3})[status]??3;}
  function aggregateStatus(statuses){const list=(statuses||[]).filter(Boolean);if(!list.length)return 'unknown';return list.reduce((worst,s)=>severity(s)>severity(worst)?s:worst,'correct');}
  function bestMatch(rawUser,answers,excluded=new Set()){
    const value=String(rawUser||'');if(!norm(value))return {status:'unknown',reason:'empty',confidence:1,matched:'',answerIndex:null,expected:String(answers.find(a=>!excluded.has(norm(a)))||answers[0]||'')};
    let best=null;
    answers.forEach((answer,index)=>{const key=norm(answer);if(excluded.has(key))return;const d=classifyDetailed(value,answer);const rank=d.status==='correct'?3:d.status==='near'?2:0;if(!best||rank>best.rank||(rank===best.rank&&d.confidence>(best.detail?.confidence||0)))best={rank,index,answer,detail:d};});
    if(best&&best.rank>0)return {...best.detail,answerIndex:best.index,expected:best.answer,matched:best.answer};
    return {status:'wrong',reason:'meaning',confidence:1,matched:'',answerIndex:null,expected:String(answers.find(a=>!excluded.has(norm(a)))||answers[0]||'')};
  }
  function gradeSetDetailed(inputs,answers){
    const claimed=new Set(),results=[];let matchedCount=0;
    (inputs||[]).forEach((value,inputIndex)=>{
      const n=norm(value);
      if(!n){results.push({inputIndex,status:'unknown',reason:'empty',value,answerIndex:null,expected:String(answers.find(a=>!claimed.has(norm(a)))||answers[0]||'')});return;}
      const allMatch=answers.findIndex(a=>norm(a)===n);
      if(allMatch>=0&&claimed.has(n)){results.push({inputIndex,status:'duplicate',reason:'duplicate',value,answerIndex:allMatch,expected:answers[allMatch]});return;}
      const d=bestMatch(value,answers,claimed);
      if((d.status==='correct'||d.status==='near')&&d.answerIndex!=null){claimed.add(norm(answers[d.answerIndex]));matchedCount++;}
      results.push({inputIndex,value,...d});
    });
    const statuses=results.map(r=>r.status);
    return {correct:matchedCount===answers.length&&statuses.every(s=>s==='correct'),matchedCount,total:answers.length,results,matchedKeys:[...claimed],status:aggregateStatus(statuses)};
  }
  function gradeSet(inputs,answers){const g=gradeSetDetailed(inputs,answers);return {...g,results:g.results.map(r=>({...r,status:r.status==='unknown'?'empty':r.status}))};}

  CL.grading={norm,normalize:norm,exact,words,stripParticle,particleEquivalent,semanticCanonical,semanticParticleEquivalent,levenshtein,decomposeHangul,likelyTypo,strongPartialMatch,strictActionSet,strictActionConflict,reasonLabel,compareNear,classifyDetailed,classify,severity,aggregateStatus,bestMatch,gradeSetDetailed,gradeSet};
})();
