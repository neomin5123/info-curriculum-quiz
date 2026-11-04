import fs from 'node:fs';
const src='data/exams/major-exams-2014-2026.json';
const out='data/generated/exam-data.js';
const data=JSON.parse(fs.readFileSync(src,'utf8'));
fs.writeFileSync(out,'window.CURRILOOP_EXAM_DATA='+JSON.stringify(data)+';\n');
console.log(`exam data mirror built: ${data.questions?.length||0} questions -> ${out}`);
