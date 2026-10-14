import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/css/app.css','utf8');
const groupStart=html.indexOf('<div class="mode-study-group">');
const cloze=html.indexOf('data-mode="cloze"', groupStart);
const area=html.indexOf('id="areaNavigator"', groupStart);
const groupEnd=html.indexOf('<div class="mode-tools">', groupStart);
if(groupStart<0||cloze<0||area<0||groupEnd<0||!(cloze<area&&area<groupEnd)){
  console.error('v9.0.43 area navigator is not immediately grouped after study modes');process.exit(1);
}
if((html.match(/id="areaNavigator"/g)||[]).length!==1){console.error('areaNavigator duplicate/missing');process.exit(1);}
const pill=html.slice(html.indexOf('<label class="retry-pill"'),html.indexOf('</label>',html.indexOf('<label class="retry-pill"'))+8);
if(pill.includes('3개 뒤')){console.error('retry pill still exposes 3개 뒤');process.exit(1);}
if(!css.includes('.mode-study-group{display:flex')){console.error('v9.0.43 mode-study-group css missing');process.exit(1);}
console.log('v9.0.43 toolbar placement PASS');
