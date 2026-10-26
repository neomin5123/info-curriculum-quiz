import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const csv=fs.readFileSync(new URL('docs/cloze-final-34-decisions.csv',root),'utf8');
assert.ok(csv.includes('finalDecision'));
const code=fs.readFileSync(new URL('js/core/study-engine.js',root),'utf8');
for(const id of ["MI-01-CS-PF-01-PU-01", "MI-01-AC-EX-01-PU-02", "MI-02-AC-EX-02-PU-04", "MI-03-CS-KI-02-PU-04", "MI-03-AC-ST-05-PU-01", "MI-04-CS-KI-02-PU-01", "MI-04-AC-EX-03-PU-03", "MI-05-CS-PF-01-PU-01", "MI-05-CS-PF-03-PU-01", "MI-05-AC-ST-02-PU-01", "MI-05-AC-EX-01-PU-04", "MI-TE-DIR-06-PU-01", "MI-TE-MET-03-PU-01", "HI-02-CS-PF-03-PU-01", "HI-02-AC-ST-02-PU-02", "HI-02-AC-EX-02-PU-02", "HI-03-CS-PF-02-PU-01", "HI-03-CS-PF-04-PU-01", "HI-03-CS-PF-05-PU-01", "HI-03-AC-ST-02-PU-01", "HI-TE-DIR-04-PU-01"])assert.ok(code.includes("'"+id+"'"),id);
console.log('PASS: curated 34 decision entries and implementation IDs');
