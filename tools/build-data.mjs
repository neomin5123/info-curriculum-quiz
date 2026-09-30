import fs from 'node:fs';
const src='data/curriculum/middle-high-v9.0.6.json';
const out='data/generated/study-data.js';
const data=JSON.parse(fs.readFileSync(src,'utf8'));
fs.writeFileSync(out,'// GENERATED FILE. Edit '+src+', then run npm run build:data.\nwindow.CURRILOOP_STUDY_DATA = '+JSON.stringify(data)+';\n');
console.log('built',out);
