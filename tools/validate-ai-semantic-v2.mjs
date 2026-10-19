import fs from 'node:fs';
import crypto from 'node:crypto';
function assert(c,m){if(!c)throw new Error(m)}
const original=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));
const ai=JSON.parse(fs.readFileSync('data/curriculum/ai-basic-2022.json','utf8'));
// Frozen fingerprint of the HWP-verified 110 sourceText lines with precisely two
// removed next-section headings (both confirmed in Build14 source audit).
const frozen = '6b6efef4e0912f27eb4bbc3f74267cddccf1c7a6016185b1ab6319a9e03b297b';
const sourceSnapshot=ai.lines.map(l=>`${l.lineId}|${l.area}|${l.family}|${l.sourceText}`).join('\n');
const hash=crypto.createHash('sha256').update(sourceSnapshot).digest('hex');
assert(ai.lines.length===110,'AI line count changed');
assert(hash===frozen,'AI HWP-verified source text/order changed');
for(const [id,fragment] of [['AI-22-GEN-TE-04','(2) 교수⋅학습 방법'],['AI-22-GEN-EV-04','(2) 평가 방법']]){
  const line=ai.lines.find(l=>l.lineId===id);
  assert(line&&!line.sourceText.includes(fragment),'next-section header leaked into AI learning item: '+id);
}
const presentation=ai.lines.flatMap(l=>l.presentation?.units||[]);
assert(presentation.length===276,'new semantic unit count changed');
assert(original.lines.length===270&&original.lines.reduce((n,l)=>n+(l.presentation?.units?.length||0),0)===370,'legacy official baseline changed');
for(const line of ai.lines){
 const units=line.presentation?.units||[], keywords=line.keywords||[];
 assert(units.length===keywords.length,'AI units and keywords diverged '+line.lineId);
 let lastEnd=0;
 for(const u of units){
  assert(Number.isInteger(u.start)&&Number.isInteger(u.end)&&u.start>=lastEnd&&u.end>u.start,'out-of-order/overlap unit '+line.lineId);
  assert(line.sourceText.slice(u.start,u.end)===u.text,'text offset mismatch '+line.lineId);
  assert(u.stage3RGrades.length===0&&['AI_2022_MANUAL_SEMANTIC_CURATION','AI_2022_MANUAL_SEMANTIC_REVIEW_V3'].includes(u.presentationBasis),'ungrounded grade / policy '+line.lineId);
  lastEnd=u.end;
 }
 if(line.family==='지식·이해')assert(units.length===0,'AI KI must be recalled as area list '+line.lineId);
 else assert(units.length>0,'missing AI semantic holes '+line.lineId);
}
const famStats={};
for(const f of ['핵심 아이디어','성취기준']){
 const lines=ai.lines.filter(l=>l.family===f);
 const n=lines.reduce((sum,l)=>sum+(l.presentation?.units?.length||0),0);
 const cover=lines.reduce((sum,l)=>sum+(l.presentation?.units||[]).reduce((s,u)=>s+u.text.length,0)/l.sourceText.length,0)/lines.length;
 assert(cover<.70,'overmasked family '+f);
 famStats[f]={lines:lines.length,units:n,averageCoverage:cover};
}
const app=fs.readFileSync('js/app.js','utf8');
assert(app.includes("subject==='ai-basic'?['semantic-v3']:[]"),'AI draft/grade input semantic revision missing');
assert(app.includes('standardBodyUnits(rawUnits,parts.offset,parts.body)'),'achievement-standard code handling lost');
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-19-build-13-ai-110-full-semantic-review.json','utf8'));
assert(audit.allLines.length===110&&audit.revisions.length===20,'AI editorial per-line audit missing');
for(const row of audit.allLines){
 const match=ai.lines.find(l=>l.lineId===row.lineId);
 assert(match&&JSON.stringify((match.presentation?.units||[]).map(u=>u.text))===JSON.stringify(row.units),'audit-to-source mismatch '+row.lineId);
}
console.log(JSON.stringify({status:'PASS',sourceLines:110,semanticUnits:276,kiWholeList:11,changedLines:20,perLineAudit:110,famStats},null,2));
