from playwright.sync_api import sync_playwright
from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
scripts=re.findall(r'<script src="([^"]+)"\s*></script>',html)
html=re.sub(r'<script src="[^"]+"\s*></script>', '',html)
html=re.sub(r'<link rel="stylesheet"[^>]*>', '',html)
ai=json.loads((root/'data/curriculum/ai-basic-2022.json').read_text())
errors=[];results={}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':390,'height':844})
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 page.add_style_tag(content=(root/'assets/css/app.css').read_text())
 for uri in scripts: page.add_script_tag(content=(root/uri.split('?')[0]).read_text())
 assert page.locator('#subjectSelect option').all_text_contents()==['전체 과목','중학교 정보','고등학교 정보','인공지능 기초']
 page.locator('#subjectSelect').select_option('ai-basic')
 assert page.locator('#areaSelect').input_value()=='인공지능의 이해'
 assert page.locator('#studyContent .cs-cloze-item').count()>=1
 results['AI_content_initial_inputs']=page.locator('#studyContent input').count()
 # Fill AI content-system fields: source-targets and 3 KI elements
 ki=[l['sourceText'] for l in ai['lines'] if l['area']=='인공지능의 이해' and l['family']=='지식·이해']
 for ix,f in enumerate(page.locator('#studyContent input').all()):
  expected=f.get_attribute('data-answer')
  if expected:
   f.fill(expected)
  elif 'group-input' in (f.get_attribute('class') or ''):
   f.fill(ki.pop(0))
 results['KI_required_fields']=3
 page.locator('#checkButton').click(force=True)
 results['correct_after_fill']=page.locator('#studyContent input.correct').count()
 assert results['correct_after_fill']==results['AI_content_initial_inputs'],results
 # AI all four areas available; content per area
 counts={}
 for area in ['인공지능의 이해','인공지능과 학습','인공지능의 사회적 영향','인공지능 프로젝트']:
  page.locator('#areaSelect').select_option(area)
  counts[area]=page.locator('#studyContent input').count()
  assert counts[area]>0,(area,counts)
 results['AI_content_area_inputs']=counts
 # Switch code-specific standards mode
 page.locator('#areaSelect').select_option('인공지능의 이해')
 page.locator('#familySelect').select_option('standards')
 results['standard_codes']=page.locator('.standard-code').all_text_contents()
 assert len(results['standard_codes'])==5,results
 assert page.locator('.standard-inline-input').count()>=5, 'no answer blanks for standards'
 assert not any('[' in (f.get_attribute('data-answer') or '') and '인기' in (f.get_attribute('data-answer') or '') for f in page.locator('.standard-inline-input').all()),'code leaked into answer'
 # source/typing/mask/cloze study controls
 for mode in ['source','typing','mask','cloze']:
  page.locator(f'[data-mode="{mode}"]').click(force=True)
  assert len(page.locator('#studyContent').inner_text())>=5
  if mode=='mask': assert page.locator('[data-reveal]').count()>=1
  if mode=='typing': assert page.locator('.standard-input').count()==5
  if mode=='cloze': assert page.locator('.standard-inline-input').count()>=5
 results['study_modes']='source,typing,mask,cloze'
 # area navigation
 page.locator('#familySelect').select_option('content-system')
 page.locator('#areaSelect').select_option('인공지능의 이해')
 nextbtn=page.locator('#nextAreaButton')
 assert not nextbtn.is_disabled()
 nextbtn.click(force=True)
 assert page.locator('#areaSelect').input_value()=='인공지능과 학습'
 results['area_navigation']='pass'
 # all areas queue 4
 page.locator('#areaSelect').select_option('all')
 results['all_areas_total']=page.locator('#progressMeta').inner_text()
 assert results['all_areas_total'].endswith('/ 4'),results
 # memo default in AI subject
 page.locator('#areaMemoTab').dispatch_event('pointerdown')
 results['memo_default_excerpt']=page.locator('#areaMemoText').input_value()[:140]
 assert '인공지능' in results['memo_default_excerpt']
 # review tab switch
 page.locator('#reviewMainTab').click(force=True)
 assert not page.locator('#reviewPage').evaluate('(e)=>e.classList.contains("hidden")')
 results['review_tab']='pass'
 # existing user subjects still intact
 page.locator('#studyMainTab').click(force=True)
 page.locator('#subjectSelect').select_option('middle-info')
 assert '컴퓨팅 시스템' in page.locator('#areaSelect option').all_text_contents()
 results['legacy_subject_switch']='pass'
 results['browser_errors']=errors
 assert not errors,errors
 browser.close()
print(json.dumps(results,ensure_ascii=False,indent=2))
