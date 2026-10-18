from pathlib import Path
from PIL import Image, ImageOps
import json, shutil

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'data/exams/major-exams-2014-2026.json'
IMGDIR=ROOT/'assets/exams'
PADDING=12
MAX_WIDTH=4096
QUALITY=80

def trim_white(img, threshold=248, margin=14):
    g=ImageOps.grayscale(img)
    mask=g.point(lambda p: 255 if p < threshold else 0)
    box=mask.getbbox()
    if not box:
        return img
    x0=max(0,box[0]-margin); y0=max(0,box[1]-margin)
    x1=min(img.width,box[2]+margin); y1=min(img.height,box[3]+margin)
    return img.crop((x0,y0,x1,y1))

data=json.load(open(DATA,encoding='utf-8'))
questions=data['questions']
old_paths=[]
segment_count=0
atlas_files=[]

for year in sorted({int(q['year']) for q in questions}):
    year_questions=[q for q in questions if int(q['year'])==year]
    items=[]
    for q in year_questions:
        for idx,meta in enumerate(q.get('images') or []):
            src=meta.get('src')
            if not src:
                raise RuntimeError(f'missing source image on {q["id"]}')
            full=ROOT/src
            if not full.exists():
                raise RuntimeError(f'source image missing: {src}')
            with Image.open(full) as source:
                img=trim_white(source.convert('RGB').copy())
            items.append({'q':q,'index':idx,'old':meta,'image':img})
            old_paths.append(full)

    x=y=row_h=0
    placements=[]
    for item in items:
        img=item['image']
        if x and x + img.width > MAX_WIDTH:
            y += row_h + PADDING
            x=0; row_h=0
        placements.append((item,x,y))
        x += img.width + PADDING
        row_h=max(row_h,img.height)
    atlas_h=y+row_h
    if atlas_h<=0:
        raise RuntimeError(f'empty atlas for {year}')
    if atlas_h>16383:
        raise RuntimeError(f'atlas too tall for WebP {year}: {atlas_h}')

    atlas=Image.new('RGB',(MAX_WIDTH,atlas_h),'white')
    atlas_name=f'atlas-{year}.webp'
    atlas_rel=f'assets/exams/{atlas_name}'
    atlas_path=ROOT/atlas_rel
    for item,px,py in placements:
        img=item['image']
        atlas.paste(img,(px,py))
    atlas.save(atlas_path,'WEBP',quality=QUALITY,method=1)
    atlas_files.append(atlas_path)

    # Update each question's image metadata after the atlas dimensions are final.
    by_question={q['id']:[] for q in year_questions}
    for item,px,py in placements:
        q=item['q']; old=item['old']; img=item['image']
        by_question[q['id']].append({
            'atlas':atlas_rel,
            'page':int(old.get('page') or 0),
            'x':int(px),'y':int(py),
            'width':int(img.width),'height':int(img.height),
            'atlasWidth':int(MAX_WIDTH),'atlasHeight':int(atlas_h)
        })
        segment_count += 1
    for q in year_questions:
        q['images']=by_question[q['id']]

# Delete the 337 legacy per-segment WebP files only after all atlases exist.
atlas_set={p.resolve() for p in atlas_files}
removed=0
for p in sorted(set(old_paths)):
    try:
        if p.exists() and p.resolve() not in atlas_set:
            p.unlink(); removed += 1
    except OSError as e:
        raise RuntimeError(f'failed to remove {p}: {e}')

data['metadata']['schemaVersion']=3
data['metadata']['imageMode']='pdf-rendered-year-atlas-crops'
data['metadata']['atlasFiles']=len(atlas_files)
notes=[n for n in data['metadata'].get('notes',[]) if '문제 표시' not in n and '이미지' not in n]
notes.append('문제 표시는 PDF 원문 렌더 조각을 연도별 atlas WebP로 묶고 좌표로 잘라 표시함')
notes.append('337개 개별 문항 이미지 대신 12개 연도별 atlas를 사용하여 정적 배포 파일 수를 축소함')
data['metadata']['notes']=notes
json.dump(data,open(DATA,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(json.dumps({'questions':len(questions),'segments':segment_count,'atlases':len(atlas_files),'removedLegacyImages':removed},ensure_ascii=False))
