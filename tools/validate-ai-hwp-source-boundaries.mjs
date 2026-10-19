import fs from 'node:fs';
import crypto from 'node:crypto';
function assert(ok,msg){if(!ok)throw new Error(msg);}
const ai=JSON.parse(fs.readFileSync('data/curriculum/ai-basic-2022.json','utf8'));
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-19-build-14-ai-hwp-source-crosscheck.json','utf8'));
const mirror=fs.readFileSync('data/generated/ai-basic-data.js','utf8');
assert(mirror.startsWith('window.CURRILOOP_AI_BASIC_DATA='),'AI served mirror missing');
const parsed=JSON.parse(mirror.slice('window.CURRILOOP_AI_BASIC_DATA='.length).trim().replace(/;$/,''));
assert(JSON.stringify(parsed)===JSON.stringify(ai),'AI source vs browser mirror mismatch');
assert(audit.beforeExactSourceMatches===110&&audit.afterExactSourceMatches===110,'HWP 110/110 source audit incomplete');
assert(audit.sourceTextCorrections.length===2,'unexpected source correction count');
const expected={
  'AI-22-GEN-TE-04':' (2) 교수⋅학습 방법',
  'AI-22-GEN-EV-04':' (2) 평가 방법'
};
for(const fix of audit.sourceTextCorrections){
 const suffix=expected[fix.lineId];
 assert(suffix&&fix.removedSuffix===suffix,'wrong HWP section heading boundary');
 const line=ai.lines.find(l=>l.lineId===fix.lineId);
 assert(line&&line.sourceText===fix.correctedSourceText&&fix.oldSourceText===line.sourceText+suffix,
        'source correction not replayable '+fix.lineId);
 assert(fix.unitOffsetsUnchanged,'AI unit boundary altered');
}
const aiRows=audit.sourceMatches;
assert(aiRows.length===110,'missing per-line HWP audit');
for(let i=0;i<aiRows.length;i++){
 const a=aiRows[i],l=ai.lines[i];
 assert(a.lineId===l.lineId&&a.exactNormalizedHWPMatch===true,'HWP source line unmatched: '+i);
 for(const u of l.presentation?.units||[])assert(l.sourceText.slice(u.start,u.end)===u.text,'offset mismatch: '+l.lineId);
}
const target=ai.lines.find(l=>l.lineId==='AI-22-PJ-ST-01');
assert(target.sourceText.includes('지속가능발전목표를 해결하기 위해'),'original unusual official wording altered');
assert(ai.lines.reduce((n,l)=>n+(l.presentation?.units?.length||0),0)===276,'AI keyword cardinality changed');
console.log(JSON.stringify({status:'PASS',sourceLines:110,hwpVerifiedLines:110,
  headingsCorrected:2,semanticUnitsPreserved:276,aiOriginalWordingPreserved:true},null,2));
