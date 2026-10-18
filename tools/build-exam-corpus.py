import fitz, json, re, os, io, shutil
from PIL import Image

ROOT='/mnt/data/curriloop_build02_work'
PDF='/mnt/data/전공 기출_260921_105741.pdf'
SRC=os.path.join(ROOT,'data/exams/major-exams-2016-2026.json')
OUT=os.path.join(ROOT,'data/exams/major-exams-2014-2026.json')
IMGDIR=os.path.join(ROOT,'assets/exams')
os.makedirs(IMGDIR,exist_ok=True)

data=json.load(open(SRC,encoding='utf-8'))
old=data['questions']

SUBJECT_ORDER=['교교론','자구알고','논회컴구','디비','데통네트웤','운체','인지머러','프로그래밍','소공','이산수학']

def remap_subject(q):
    s=q['subject']
    mp={
      '정보 교과교육론':'교교론',
      '자료구조·알고리즘':'자구알고',
      '컴퓨터구조·디지털논리':'논회컴구',
      '데이터베이스':'디비',
      '데이터통신·네트워크':'데통네트웤',
      '운영체제':'운체',
      '인공지능':'인지머러',
      '프로그래밍':'프로그래밍',
      '이산수학':'이산수학',
    }
    if s=='소프트웨어공학·정보보안':
        return '데통네트웤' if '암호' in (q.get('topics') or []) else '소공'
    return mp.get(s,s)

for q in old:
    q['subject']=remap_subject(q)

pdf=fitz.open(PDF)
# section starts (0-based pages)
section_starts=[]
for i,p in enumerate(pdf):
    t=p.get_text('text')
    m=re.search(r'(20\d{2})학년도',t)
    pa=bool(re.search(r'전공\s*\[?A\]?|전공A|전공 A',t)); pb=bool(re.search(r'전공\s*\[?B\]?|전공B|전공 B',t))
    if m and pa!=pb:
        section_starts.append((i,int(m.group(1)),'A' if pa else 'B'))
sections={}
for idx,(s,y,part) in enumerate(section_starts):
    e=section_starts[idx+1][0] if idx+1<len(section_starts) else len(pdf)
    sections[(y,part)]=(s,e)

# detect true starts: actual question labels sit on column outer margins; nested numbered items are indented.
def true_starts(year,part):
    s,e=sections[(year,part)]
    arr=[]
    for pi in range(s,e):
        p=pdf[pi]
        for b in p.get_text('blocks'):
            x0,y0,x1,y1,text,*_=b
            ss=''.join(text.split())[:160]
            m=re.match(r'^(\d{1,2})\.',ss)
            if m and (x0<100 or 350<x0<450):
                arr.append({'printed':int(m.group(1)),'page':pi,'col':0 if x0<300 else 1,'x':x0,'y':y0})
    arr.sort(key=lambda z:(z['page'],z['col'],z['y']))
    return arr

# manual 2014 normalized numbering and taxonomy
spec2014={
 ('A',1):('교교론',['교육과정','교육 목표'],'2009 개정 교육과정 고등학교 정보 과목 교육 목표'),
 ('A',2):('교교론',['ARCS','학습동기'],'켈러 ARCS 이론에 따른 탐색 알고리즘 동기 유발 계획'),
 ('A',3):('교교론',['교육과정','영역 성취기준'],'2009 개정 중학교 정보과 교육과정 영역 성취 기준'),
 ('A',4):('데통네트웤',['정보보안','기밀성·무결성·가용성'],'정보보안의 목표'),
 ('A',5):('논회컴구',['논리회로','불 대수'],'조합논리회로 간소화'),
 ('A',6):('자구알고',['트리','순회'],'이진트리 순회'),
 ('A',7):('프로그래밍',['C 언어','매개변수 전달'],'매개변수 전달 방식 C 유사언어'),
 ('A',8):('디비',['SQL','집계'],'온라인 쇼핑몰 SQL'),
 ('A',9):('프로그래밍',['C 언어','재귀'],'C 재귀 프로그램'),
 ('A',10):('데통네트웤',['RIP','라우팅'],'RIP 라우팅 테이블 갱신'),
 ('A',11):('교교론',['정보처리이론','ASSURE'],'감각기억과 ASSURE 모델'),
 ('A',12):('교교론',['교육평가','내용 타당도'],'정보의 이진 표현 평가 계획'),
 ('A',13):('운체',['CPU 스케줄링','라운드 로빈','우선순위'],'CPU 스케줄링'),
 ('A',14):('데통네트웤',['IPv4','서브넷','CIDR'],'IPv4 서브넷과 주소 고갈'),
 ('B',1):('소공',['프로젝트 관리','임계 경로'],'소프트웨어 개발 프로젝트 임계 경로'),
 ('B',2):('디비',['정규화','BCNF','무손실 조인'],'정규화와 BCNF 무손실 조인'),
 ('B',3):('자구알고',['연결리스트','C 언어'],'단일 연결리스트 insertNode'),
 ('B',4):('논회컴구',['캐시','집합-연관 사상','LRU'],'집합-연관 사상 캐시'),
 ('B',5):('교교론',['문제중심학습','교수·학습'],'문제중심학습 교수·학습 계획'),
 ('B',6):('자구알고',['그래프','백트래킹','지도 색칠'],'지도 색칠하기와 백트래킹'),
}

# segment geometry and content extraction
def bounds_for(page, col, year, section_start):
    p=pdf[page]; w=p.rect.width; h=p.rect.height
    if year==2014:
        x0,x1=(30,w/2-5) if col==0 else (w/2+5,w-30)
        top=238 if page==section_start else 65
        bottom=h-70
    else:
        x0,x1=(75,w/2-4) if col==0 else (w/2+4,w-75)
        top=270 if page==section_start else 130
        bottom=h-85
    return x0,top,x1,bottom

def clip_text(page,col,y0,y1,year,section_start):
    x0,top,x1,bottom=bounds_for(page,col,year,section_start)
    rect=fitz.Rect(x0,max(top,y0),x1,min(bottom,y1))
    return pdf[page].get_text('text',clip=rect).strip()

def render_clip(qid, idx, page, col, y0, y1, year, section_start):
    x0,top,x1,bottom=bounds_for(page,col,year,section_start)
    yy0=max(top,y0); yy1=min(bottom,y1)
    if yy1-yy0 < 38: return None
    rect=fitz.Rect(x0,yy0,x1,yy1)
    # Render at 2.0x: a column is ~650-700 px wide, readable without resampling.
    pix=pdf[page].get_pixmap(matrix=fitz.Matrix(2.0,2.0),clip=rect,alpha=False)
    im=Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')
    path=f'assets/exams/{qid}-{idx}.webp'
    full=os.path.join(ROOT,path)
    if os.path.exists(full):
        try:
            with Image.open(full) as old:
                old.verify()
            with Image.open(full) as old:
                return {'src':path,'page':page+1,'width':old.width,'height':old.height}
        except Exception:
            try: os.unlink(full)
            except OSError: pass
    im.save(full,format='WEBP',quality=80,method=4)
    return {'src':path,'page':page+1,'width':im.width,'height':im.height}

def spans_for_questions(year,part, normalized_count, printed_sequence=None):
    starts=true_starts(year,part)
    if printed_sequence is None:
        expected=list(range(1,normalized_count+1))
    else:
        expected=printed_sequence
    got=[s['printed'] for s in starts]
    if got!=expected:
        raise RuntimeError(f'{year}{part} start sequence mismatch: {got} != {expected}')
    s0,e0=sections[(year,part)]
    # ordered segment keys in reading order
    segs=[(pi,col) for pi in range(s0,e0) for col in (0,1)]
    seg_index={v:i for i,v in enumerate(segs)}
    out=[]
    for qi,st in enumerate(starts):
        nxt=starts[qi+1] if qi+1<len(starts) else None
        sidx=seg_index[(st['page'],st['col'])]
        nidx=seg_index[(nxt['page'],nxt['col'])] if nxt else len(segs)
        clips=[]
        if nxt and sidx==nidx:
            clips=[(st['page'],st['col'],st['y']-7,nxt['y']-9)]
        else:
            # first segment to bottom
            _,_,_,b=bounds_for(st['page'],st['col'],year,s0)
            clips.append((st['page'],st['col'],st['y']-7,b))
            # intermediate whole segments, then pre-next region of final segment
            if nxt:
                for j in range(sidx+1,nidx):
                    pi,col=segs[j]; _,t,_,b=bounds_for(pi,col,year,s0)
                    clips.append((pi,col,t,b))
                pi,col=segs[nidx]; _,t,_,_=bounds_for(pi,col,year,s0)
                clips.append((pi,col,t,nxt['y']-9))
            else:
                for j in range(sidx+1,len(segs)):
                    pi,col=segs[j]; _,t,_,b=bounds_for(pi,col,year,s0)
                    clips.append((pi,col,t,b))
        # drop tiny/blank continuations; keep first regardless of text because diagrams may dominate.
        clean=[]
        for ci,c in enumerate(clips):
            pi,col,y0,y1=c
            if y1-y0<38: continue
            txt=clip_text(pi,col,y0,y1,year,s0)
            if ci>0 and len(re.sub(r'\s+','',txt))<12:
                continue
            clean.append(c)
        out.append((st,clean))
    return out

# Add 2014 records based on image/text segments.
new2014=[]
for part,count,printed in [('A',14,[1,2,3,4,5,6,7,8,9,10,1,2,3,4]),('B',6,[1,2,3,4,1,2])]:
    spans=spans_for_questions(2014,part,count,printed)
    s0,_=sections[(2014,part)]
    for i,(st,clips) in enumerate(spans,1):
        subject,topics,title=spec2014[(part,i)]
        texts=[]
        for pi,col,y0,y1 in clips:
            t=clip_text(pi,col,y0,y1,2014,s0)
            if t: texts.append(t)
        text='\n'.join(texts)
        # preserve readable separation while avoiding total whitespace loss
        text=re.sub(r'[ \t]+',' ',text)
        points=None
        m=re.search(r'\[(\d+)점\]',text.replace(' ',''))
        if m: points=int(m.group(1))
        qid=f'2014-{part}-{i:02d}'
        if part=='A':
            question_label=f'기입형 {i}번' if i<=10 else f'서술형 {i-10}번'
        else:
            question_label=f'서술형 {i}번' if i<=4 else f'논술형 {i-4}번'
        new2014.append({
          'id':qid,'year':2014,'part':part,'question':i,'questionLabel':question_label,'points':points,
          'subject':subject,'topics':topics,'title':title,'text':text,
          'answer':'','solution':'','solutionStatus':'pending',
          'source':{'file':'전공 기출_260921_105741.pdf','pages':[]},
          'images':[]
        })

questions=new2014+old
# Generate exact image crops for every question and replace exact source pages.
by_section={}
for q in questions: by_section.setdefault((q['year'],q['part']),[]).append(q)
for k in by_section: by_section[k].sort(key=lambda q:q['question'])

for (year,part),qs in sorted(by_section.items()):
    if year==2014:
        printed=[1,2,3,4,5,6,7,8,9,10,1,2,3,4] if part=='A' else [1,2,3,4,1,2]
        spans=spans_for_questions(year,part,len(qs),printed)
    else:
        spans=spans_for_questions(year,part,len(qs))
    s0,_=sections[(year,part)]
    if len(spans)!=len(qs): raise RuntimeError((year,part,len(spans),len(qs)))
    for q,(st,clips) in zip(qs,spans):
        imgs=[]
        for idx,(pi,col,y0,y1) in enumerate(clips,1):
            meta=render_clip(q['id'],idx,pi,col,y0,y1,year,s0)
            if meta: imgs.append(meta)
        if not imgs: raise RuntimeError(f'no image for {q["id"]}')
        q['images']=imgs
        q['source']['pages']=sorted(set(x['page'] for x in imgs))

# stable sort newest first is UI concern; corpus chronological for auditing
questions.sort(key=lambda q:(q['year'],q['part'],q['question']))
solved=sum(q['solutionStatus']=='solved' for q in questions)
meta=data['metadata']
meta.update({
 'schemaVersion':2,
 'coverage':{'from':2014,'to':2026,'missingYears':[2015],'questions':len(questions),'solved':solved},
 'subjectOrder':SUBJECT_ORDER,
 'imageMode':'pdf-rendered-question-crops',
 'notes':[
   '2014학년도 전공A 14문항·전공B 6문항을 원 PDF 렌더 기준으로 복원',
   '2015학년도는 사용자 제공 PDF에 수록되어 있지 않음',
   '문제 표시는 PDF 원문 렌더 이미지를 기본으로 하고 추출 텍스트는 검색·접근성 보조로 유지',
   '제공 PDF는 문제지이며 공식 정답·해설을 포함하지 않아 검증된 문항만 solutionStatus=solved로 공개'
 ]
})
data['questions']=questions
json.dump(data,open(OUT,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('wrote',OUT,'questions',len(questions),'solved',solved,'images',sum(len(q['images']) for q in questions))
print('assets MB',sum(os.path.getsize(os.path.join(IMGDIR,f)) for f in os.listdir(IMGDIR))/1024/1024)
