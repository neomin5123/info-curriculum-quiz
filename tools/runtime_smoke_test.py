#!/usr/bin/env python3
from pathlib import Path
from playwright.sync_api import sync_playwright
import re, sys, os, shutil

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')
errors=[]
results=[]

def check(name, cond, detail=''):
    status='PASS' if cond else 'FAIL'
    results.append((name,status,detail))
    if not cond:
        errors.append(name + (': '+detail if detail else ''))

# The execution environment blocks localhost/file:// navigation and opaque about:blank
# documents cannot access the browser's native Storage objects. For UI logic testing only,
# replace Storage references in the first (application) inline script with an in-memory API.
STUB = r'''
window.__testLocalStorage = (() => {
  const data = new Map();
  return {
    get length(){ return data.size; },
    key(i){ return [...data.keys()][i] ?? null; },
    getItem(k){ k=String(k); return data.has(k) ? data.get(k) : null; },
    setItem(k,v){ data.set(String(k),String(v)); },
    removeItem(k){ data.delete(String(k)); },
    clear(){ data.clear(); }
  };
})();
window.__testSessionStorage = (() => {
  const data = new Map();
  return {
    get length(){ return data.size; },
    key(i){ return [...data.keys()][i] ?? null; },
    getItem(k){ k=String(k); return data.has(k) ? data.get(k) : null; },
    setItem(k,v){ data.set(String(k),String(v)); },
    removeItem(k){ data.delete(String(k)); },
    clear(){ data.clear(); }
  };
})();
'''

scripts=list(re.finditer(r'<script(?:\s[^>]*)?>(.*?)</script>', HTML, flags=re.S|re.I))
if not scripts:
    raise SystemExit('No inline script found')
first=scripts[0]
app_code=first.group(1)
app_code=re.sub(r'\blocalStorage\b', 'window.__testLocalStorage', app_code)
app_code=re.sub(r'\bsessionStorage\b', 'window.__testSessionStorage', app_code)
TEST_HTML=HTML[:first.start(1)] + STUB + '\n' + app_code + HTML[first.end(1):]

with sync_playwright() as p:
    executable = os.getenv('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('chromium-browser')
    launch_args = {'headless': True, 'args': ['--no-sandbox']}
    if executable:
        launch_args['executable_path'] = executable
    browser=p.chromium.launch(**launch_args)
    page=browser.new_page(viewport={'width':1366,'height':900})
    page_errors=[]
    page.on('pageerror', lambda exc: page_errors.append(str(exc)))
    page.set_content(TEST_HTML, wait_until='load')
    page.wait_for_timeout(80)

    check('page title', page.title()=='CurriLoop', page.title())
    check('no initial JS pageerror', not page_errors, ' | '.join(page_errors[:3]))
    check('difficulty labels', page.locator('#difficultySelect option').all_text_contents()==['핵심','정밀','야~호!'])
    check('punctuation normalization', page.evaluate("normalize('기술·가정/정보 교과(군)') === normalize('기술가정정보 교과군')"))
    check('official source control exists', page.locator('#sourceButton').count()==1 and '공식 출처' in page.locator('#sourceButton').inner_text())

    page.locator('#subjectTab').click()
    page.select_option('#subjectSelect','middle-info')
    page.select_option('#areaSelect', label='컴퓨팅 시스템')
    page.select_option('#groupSelect','content-system')
    page.select_option('#difficultySelect','easy')
    page.locator('#startQuizButton').click()
    inputs=page.locator('#studyArea .gap-input')
    count=inputs.count()
    check('middle-info quiz has blanks', count>0, str(count))
    first_input=inputs.nth(0)
    first_input.focus()
    before=first_input.get_attribute('data-state-key')
    page.keyboard.press('Enter')
    page.wait_for_timeout(80)
    check('blank Enter graded wrong', 'wrong' in (first_input.get_attribute('class') or ''))
    active=page.evaluate("document.activeElement?.dataset?.stateKey || ''")
    check('blank Enter advances focus', bool(active) and active!=before, active)
    hist=page.evaluate("JSON.parse(window.__testLocalStorage.getItem('coreloop-wrong-history-v1') || '[]')")
    check('blank Enter stored as wrong', any(x.get('userAnswer','')=='' for x in hist), f'{len(hist)} records')

    page.locator('#resetUnitButton').click()
    inputs=page.locator('#studyArea .gap-input')
    total=inputs.count()
    page.locator('#gradeAllButton').click()
    page.wait_for_timeout(80)
    wrong=page.locator('#studyArea .gap-input.wrong').count()
    check('grade-all includes blank inputs', total>0 and wrong==total, f'{wrong}/{total}')

    page.locator('#originalButton').click()
    check('original view is separate from reset', page.locator('#studyArea .gap-input').count()==0)

    # In random mode, pressing Enter on the final visible blank should finish the unit
    # and immediately draw the next unit from the shuffle-bag.
    page.select_option('#subjectSelect','middle-info')
    page.select_option('#areaSelect','random')
    page.select_option('#groupSelect','content-system')
    page.select_option('#difficultySelect','easy')
    page.locator('#startQuizButton').click()
    before_title=page.locator('#unitNavTitle').inner_text()
    rinputs=page.locator('#studyArea .gap-input')
    rc=rinputs.count()
    check('random unit has blanks', rc>0, str(rc))
    # Grade all but the last blank first so the last Enter is the unit-ending action.
    for i in range(max(0, rc-1)):
        rinputs.nth(i).focus()
        page.keyboard.press('Enter')
        page.wait_for_timeout(10)
    rinputs=page.locator('#studyArea .gap-input')
    if rinputs.count():
        rinputs.nth(rinputs.count()-1).focus()
        page.keyboard.press('Enter')
    page.wait_for_timeout(120)
    after_title=page.locator('#unitNavTitle').inner_text()
    check('random unit auto-continues', before_title!=after_title, f'{before_title} -> {after_title}')

    legacy=[{'type':'subject','subjectKey':'middle-info','area':'컴퓨팅 시스템','groupKey':'content-system','sourceGroup':'content-system','lineId':'1gji2b-1w2fgs6','answerText':'컴퓨팅 시스템','correctAnswer':'컴퓨팅 시스템','answerOccurrence':0,'difficultyKey':'hard','difficultyLabel':'어려움','context':'컴퓨팅 시스템의 동작 원리','userAnswer':'x','attempts':1,'lastWrongAt':'2026-01-01T00:00:00.000Z'}]
    page.evaluate("v => window.__testLocalStorage.setItem('coreloop-wrong-history-v1', JSON.stringify(v))", legacy)
    migrated=page.evaluate('loadHistory()')
    check('legacy hard history migration', migrated[0]['difficultyKey']=='normal' and migrated[0]['difficultyLabel']=='정밀')
    check('legacy stable line ID migration', migrated[0].get('lineId')=='MI-01-CS-KN-01', migrated[0].get('lineId',''))
    check('legacy history gains long-term metadata', bool(migrated[0].get('firstWrongAt')) and isinstance(migrated[0].get('wrongEvents'), list))
    page.evaluate("showTab('history'); renderHistory()")
    history_text=page.locator('#historyList').inner_text()
    check('history renders current difficulty label', '정밀' in history_text and '어려움' not in history_text, history_text[:160])
    page.evaluate("showTab('subject')")

    # Public backup validators should reject malformed history instead of silently filtering it.
    check('backup history validator accepts migrated record', page.evaluate('validateBackupHistoryRecord(loadHistory()[0])'))
    check('backup history validator rejects malformed record', not page.evaluate("validateBackupHistoryRecord({type:'subject', attempts:-1})"))

    page.evaluate("window.confirm=()=>true; window.alert=m=>{window.__lastAlert=String(m)}")
    page.evaluate("""() => {
      const h = loadHistory();
      const payload = {schemaVersion:4, app:'CurriLoop', counts:{history:h.length, mastery:0}, history:h, mastery:{}, theme:'light'};
      const file = new File([JSON.stringify(payload)], 'good.json', {type:'application/json'});
      importStudyData({target:{files:[file], value:''}});
    }""")
    page.wait_for_timeout(120)
    imported=page.evaluate("JSON.parse(window.__testLocalStorage.getItem('coreloop-wrong-history-v1')||'[]')")
    undo_saved=page.evaluate("Boolean(window.__testLocalStorage.getItem('curriloop-preimport-backup-v1'))")
    check('valid backup import succeeds', len(imported)==1 and undo_saved, f'{len(imported)}/undo={undo_saved}')
    before_bad=page.evaluate("window.__testLocalStorage.getItem('coreloop-wrong-history-v1')")
    page.evaluate("""() => {
      const payload = {schemaVersion:4, app:'CurriLoop', counts:{history:1, mastery:0}, history:[{type:'subject', attempts:-1}], mastery:{}};
      const file = new File([JSON.stringify(payload)], 'bad.json', {type:'application/json'});
      importStudyData({target:{files:[file], value:''}});
    }""")
    page.wait_for_timeout(120)
    after_bad=page.evaluate("window.__testLocalStorage.getItem('coreloop-wrong-history-v1')")
    last_alert=page.evaluate("window.__lastAlert || ''")
    check('malformed backup is rejected without mutation', before_bad==after_bad and '적용하지 않았습니다' in last_alert, last_alert[:100])

    page.set_viewport_size({'width':390,'height':844})
    # Force selector controls open then verify ARIA state follows visual state.
    page.locator('#mobileSettingsToggle').click()
    expanded=page.locator('#mobileSettingsToggle').get_attribute('aria-expanded')
    controls=page.locator('#mobileSettingsToggle').get_attribute('aria-controls')
    check('mobile settings ARIA linkage', expanded in ('true','false') and controls=='subjectSettingsControls', f'{expanded}/{controls}')
    overflow=page.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth + 1')
    offenders=page.evaluate("""() => [...document.querySelectorAll('body *')].map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,id:el.id,cls:el.className,left:r.left,right:r.right,width:r.width,display:getComputedStyle(el).display}}).filter(x=>x.display!=='none' && (x.left < -1 || x.right > document.documentElement.clientWidth+1)).sort((a,b)=>b.right-a.right).slice(0,8)""")
    check('mobile no horizontal page overflow', not overflow, f"{page.evaluate('document.documentElement.scrollWidth')}/{page.evaluate('document.documentElement.clientWidth')} offenders={offenders}")

    page.locator('.help-button').click()
    check('help modal opens', not page.locator('#helpModalBackdrop').evaluate("el=>el.classList.contains('hidden')"))
    page.keyboard.press('Escape')
    check('help modal Escape closes', page.locator('#helpModalBackdrop').evaluate("el=>el.classList.contains('hidden')"))

    page.set_viewport_size({'width':1366,'height':900})
    overflow=page.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth + 1')
    check('desktop no horizontal page overflow', not overflow)
    check('no runtime JS pageerror', not page_errors, ' | '.join(page_errors[:5]))
    browser.close()

for name,status,detail in results:
    print(f'{status}: {name}' + (f' — {detail}' if detail else ''))
if errors:
    print('\nFailures:')
    for e in errors:
        print('*',e)
    sys.exit(1)
print(f'\nRuntime smoke test: PASS ({len(results)} checks)')
