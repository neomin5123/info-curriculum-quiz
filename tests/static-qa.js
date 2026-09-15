'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const ctx = {window:{}}; vm.createContext(ctx);
for (const file of ['data/curriculum-data.js','data/supplemental-data.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'), ctx, {filename:file});
}
const data = ctx.window.CURRILOOP_CURRICULUM_DATA;
if (!data) throw new Error('curriculum missing');
let subjects=0, areas=0, lines=0, gaps=0, invalid=0, dupIds=0;
const ids = new Set();
for (const [subject, subjectData] of Object.entries(data)) {
  subjects++;
  for (const [area, groups] of Object.entries(subjectData)) {
    areas++;
    for (const [group, sections] of Object.entries(groups)) {
      if (!Array.isArray(sections)) continue;
      for (const section of sections) for (const line of section.lines || []) {
        lines++;
        if (ids.has(line.id)) dupIds++; else ids.add(line.id);
        for (const level of ['easy','normal']) {
          const arr=line[level]||[], gid=line.gapIds?.[level]||[];
          gaps += arr.length;
          if (gid.length !== arr.length) invalid++;
          arr.forEach(a=>{ if (!line.text.includes(a)) invalid++; });
        }
      }
    }
  }
}
if (subjects !== 6) throw new Error(`subjects ${subjects}`);
if (invalid) throw new Error(`invalid gaps ${invalid}`);
if (dupIds) throw new Error(`duplicate line ids ${dupIds}`);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for (const asset of ['/js/learning-engine.js?v=6.8.0','/js/practical-engine.js?v=6.8.0','/js/grading-engine.js?v=6.8.0','/app.js?v=6.8.0']) if(!html.includes(asset)) throw new Error(`missing script ${asset}`);
const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
for (const asset of ['/js/learning-engine.js?v=6.8.0','/js/practical-engine.js?v=6.8.0','/js/grading-engine.js?v=6.8.0']) if(!sw.includes(asset)) throw new Error(`SW missing ${asset}`);
console.log(JSON.stringify({subjects,areas,lines,gaps,invalid,dupIds},null,2));
