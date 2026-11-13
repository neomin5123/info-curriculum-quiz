from pathlib import Path
import json, re
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1]
h=(r/'index.html').read_text()
scripts=re.findall(r'<script src="([^"]+)"\s*></script>',h)
h=re.sub(r'<script src="[^"]+"\s*></script>','',h)
h=re.sub(r'<link rel="stylesheet"[^>]*>','',h)
errors=[];checks=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1240,'height':850})
 page.on('pageerror',lambda e: errors.append(str(e)))
 page.set_content(h)
 page.add_style_tag(content=(r/'assets/css/app.css').read_text())
 for s in scripts:page.add_script_tag(content=(r/s.split('?')[0]).read_text())
 checks.append(('boot',len(page.locator('#subjectSelect option').all_text_contents())>=5))
 for subject,area in [('middle-info','컴퓨팅 시스템'),('high-info','데이터'),('ai-basic','인공지능과 학습'),('data-science','데이터 과학의 이해')]:
  page.locator('#subjectSelect').select_option(subject)
  page.locator('#areaSelect').select_option(area)
  checks.append((f'area-{subject}',page.locator('#studyContent').count()==1 and bool(page.locator('#studyContent').inner_text().strip())))
 page.locator('#subjectSelect').select_option('middle-info')
 page.locator('#areaSelect').select_option('컴퓨팅 시스템')
 page.locator('#familySelect').select_option('content-standards-explanations')
 checks.append(('combined-mode', bool(page.locator('#studyContent').inner_text().strip())))
 # mask mode should not leak answers in title attributes
 page.locator('[data-mode="mask"]').click(force=True)
 checks.append(('no-title-leak',page.locator('input[title]').count()==0))
 # original browser tooltips and page navigation handled by existing global runtime
 checks.append(('no-js-pageerror',len(errors)==0))
 assert all(ok for name,ok in checks),dict(checks=checks,errors=errors)
 b.close()
print(json.dumps({'status':'PASS','checks':checks,'browserErrors':errors,'environment':'offline Chromium DOM; not live deployment'},ensure_ascii=False,indent=2))
