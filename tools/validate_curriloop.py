#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
SW = ROOT / "service-worker.js"
SNAPSHOT = ROOT / "tools" / "middle_info_official_snapshot.json"

EXPECTED_SUBJECTS = {
    "middle-info", "high-info", "ai-basic", "data-science", "software-life", "info-science"
}
EXPECTED_MIDDLE_AREAS = ["컴퓨팅 시스템", "데이터", "알고리즘과 프로그래밍", "인공지능", "디지털 문화"]
LEGACY_AUTO_SYMBOLS = [
    "deriveHardWords", "deriveNormalWords", "buildEasyPhrases", "deriveEasyFallbackWords",
    "recoverConfiguredCoreTerms", "findCompoundTerms", "HARD_SUFFIXES", "EASY_PRIORITY_TERMS",
    "COMPOUND_TERMS", "NORMAL_ACTION_STEMS", "NORMAL_LOW_INFORMATION", "EASY_DENSE_SECTIONS"
]


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKC", str(value or "")).lower()
    return re.sub(r"[\s,.;:!?·ㆍ・∙‧⋅\-_/()\[\]{}'\"“”‘’]+", "", value).strip()


def extract_json_constant(html: str, name: str):
    m = re.search(rf"\bconst\s+{re.escape(name)}\s*=\s*(\{{.*?\}}|\[.*?\]);\s*\n", html, re.S)
    if not m:
        raise AssertionError(f"{name} 상수를 찾지 못함")
    return json.loads(m.group(1))


def accepted_gap_count(text: str, terms: list[str]) -> int:
    phrases = sorted(set(t for t in terms if t and t in text), key=len, reverse=True)
    found = []
    for phrase in phrases:
        start = 0
        while start < len(text):
            idx = text.find(phrase, start)
            if idx < 0:
                break
            found.append((idx, idx + len(phrase), phrase))
            start = idx + len(phrase)
    found.sort(key=lambda item: (item[0], -(item[1] - item[0])))
    last_end = -1
    used = set()
    accepted = []
    for start, end, phrase in found:
        if start < last_end:
            continue
        key = normalize(phrase)
        if key in used:
            continue
        accepted.append((start, end, phrase))
        used.add(key)
        last_end = end
    return len(accepted)


def iter_lines(data):
    for subject_key, subject in data.items():
        for area_name, area in subject.items():
            for group in ("content-system", "achievement"):
                for section in area.get(group, []):
                    for line in section.get("lines", []):
                        yield subject_key, area_name, group, section.get("title", ""), line


def node_check(path: Path) -> tuple[bool, str]:
    proc = subprocess.run(["node", "--check", str(path)], capture_output=True, text=True)
    return proc.returncode == 0, (proc.stderr or proc.stdout).strip()


def visible_html_text(html: str) -> str:
    # User-visible body text/attributes only; migration strings inside script are intentionally excluded.
    visible = re.sub(r"<script\b[^>]*>.*?</script>", " ", html, flags=re.I | re.S)
    visible = re.sub(r"<style\b[^>]*>.*?</style>", " ", visible, flags=re.I | re.S)
    visible = re.sub(r"<!--.*?-->", " ", visible, flags=re.S)
    visible = re.sub(r"<[^>]+>", " ", visible)
    return re.sub(r"\s+", " ", visible)


def main() -> int:
    failures: list[str] = []
    notes: list[str] = []
    html = INDEX.read_text(encoding="utf-8")

    try:
        data = extract_json_constant(html, "curriculumData")
    except Exception as exc:
        print(f"FAIL curriculumData parse: {exc}")
        return 1

    # JS syntax: every inline script + service worker.
    scripts = re.findall(r"<script(?:\s[^>]*)?>(.*?)</script>", html, flags=re.S | re.I)
    with tempfile.TemporaryDirectory() as tmp:
        for i, script in enumerate(scripts, 1):
            js_path = Path(tmp) / f"inline-{i}.js"
            js_path.write_text(script, encoding="utf-8")
            ok, msg = node_check(js_path)
            if not ok:
                failures.append(f"inline JS #{i} 문법 오류: {msg}")
    ok, msg = node_check(SW)
    if not ok:
        failures.append(f"Service Worker 문법 오류: {msg}")

    # Required subject / area topology.
    subjects = set(data)
    if subjects != EXPECTED_SUBJECTS:
        failures.append(f"6과목 불일치: {sorted(subjects)}")
    area_count = sum(len(subject) for subject in data.values())
    if area_count != 27:
        failures.append(f"영역 수 {area_count} (예상 27)")

    rows = list(iter_lines(data))
    if len(rows) != 550:
        failures.append(f"교육과정 문장 수 {len(rows)} (예상 550)")

    ids = [line.get("id", "") for *_, line in rows]
    missing_ids = [row for row in rows if not row[-1].get("id")]
    if missing_ids:
        failures.append(f"명시적 stable ID 누락 {len(missing_ids)}건")
    dup_ids = [key for key, count in Counter(ids).items() if key and count > 1]
    if dup_ids:
        failures.append(f"중복 stable ID {len(dup_ids)}건: {dup_ids[:10]}")

    zero_easy = []
    zero_normal = []
    missing_terms = []
    precision_less = []
    for subject, area, group, section, line in rows:
        text = line.get("text", "")
        easy = line.get("easy", []) or []
        normal = line.get("normal", []) or []
        for level, terms in (("핵심", easy), ("정밀", normal)):
            for term in terms:
                if term and term not in text:
                    missing_terms.append((line.get("id"), level, term))
        easy_count = accepted_gap_count(text, easy)
        normal_count = accepted_gap_count(text, normal)
        if easy_count == 0:
            zero_easy.append(line.get("id"))
        if normal_count == 0:
            zero_normal.append(line.get("id"))
        if normal_count < easy_count:
            precision_less.append((line.get("id"), easy_count, normal_count))

    if zero_easy:
        failures.append(f"핵심 빈칸 0개 문장 {len(zero_easy)}건: {zero_easy[:10]}")
    if zero_normal:
        failures.append(f"정밀 빈칸 0개 문장 {len(zero_normal)}건: {zero_normal[:10]}")
    if missing_terms:
        failures.append(f"원문에 없는 수동 빈칸 {len(missing_terms)}건: {missing_terms[:10]}")
    if precision_less:
        failures.append(f"정밀 빈칸 수 < 핵심 이상 사례 {len(precision_less)}건: {precision_less[:10]}")

    # General-bank IDs.
    g_match = re.search(r"\bconst\s+generalBank\s*=\s*\[(.*?)\];", html, re.S)
    if not g_match:
        failures.append("generalBank를 찾지 못함")
        general_ids = []
    else:
        general_ids = re.findall(r"\bid\s*:\s*[\"']([^\"']+)[\"']", g_match.group(1))
        dup_general = [key for key, count in Counter(general_ids).items() if count > 1]
        if dup_general:
            failures.append(f"총론 ID 중복 {len(dup_general)}건: {dup_general[:10]}")
        if not general_ids:
            failures.append("총론 ID를 추출하지 못함")

    # Legacy labels must not remain in user-visible markup.
    visible = visible_html_text(html)
    # '보통 교과' is curriculum terminology and appears only in JS data, so visible markup can be strict.
    old_labels = [label for label in ("쉬움", "보통", "어려움") if label in visible]
    if old_labels:
        failures.append(f"사용자 화면에 옛 난이도 명칭 잔존: {old_labels}")
    for required in ("핵심", "정밀", "야~호!"):
        if required not in visible:
            failures.append(f"사용자 화면 난이도 명칭 누락: {required}")

    # Auto-gap dead code must be gone; 'hard' itself is allowed only for migration compatibility.
    dead = [symbol for symbol in LEGACY_AUTO_SYMBOLS if symbol in html]
    if dead:
        failures.append(f"구형 자동 빈칸 dead code 잔존: {dead}")

    # Official middle-info source lock.
    snap = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
    middle = data.get("middle-info", {})
    if list(middle) != EXPECTED_MIDDLE_AREAS:
        failures.append(f"중학교 정보 영역 불일치: {list(middle)}")
    current_middle = {line["id"]: line for s,a,g,t,line in rows if s == "middle-info"}
    if len(current_middle) != 111:
        failures.append(f"중학교 정보 문장 수 {len(current_middle)} (예상 111)")
    snapshot_map = {line["id"]: line for line in snap.get("lines", [])}
    if len(snapshot_map) != 111:
        failures.append(f"공식 source-lock 문장 수 {len(snapshot_map)} (예상 111)")
    missing_source = sorted(set(snapshot_map) - set(current_middle))
    extra_source = sorted(set(current_middle) - set(snapshot_map))
    source_mismatch = [
        lid for lid in sorted(set(snapshot_map) & set(current_middle))
        if snapshot_map[lid]["text"] != current_middle[lid].get("text")
        or str(snapshot_map[lid].get("sourcePage", "")) != str(current_middle[lid].get("sourcePage", ""))
    ]
    if missing_source or extra_source or source_mismatch:
        failures.append(
            f"중학교 정보 공식 원문 대응 불일치: 누락 {len(missing_source)}, 추가 {len(extra_source)}, 본문/페이지 차이 {len(source_mismatch)}"
        )

    # PWA basics and final cache identity.
    try:
        manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
        if manifest.get("start_url") != "/" or manifest.get("display") != "standalone":
            failures.append("PWA manifest 핵심 설정 불일치")
    except Exception as exc:
        failures.append(f"manifest 파싱 실패: {exc}")
    sw_text = SW.read_text(encoding="utf-8")
    if "rc1" in sw_text.lower():
        failures.append("Service Worker 캐시 이름에 rc1 잔존")

    status = "PASS" if not failures else "FAIL"
    print(f"CurriLoop validation: {status}")
    print(f"- subjects: {len(subjects)}")
    print(f"- areas: {area_count}")
    print(f"- curriculum lines: {len(rows)}")
    print(f"- general IDs: {len(general_ids)}")
    print(f"- middle-info source lock: {len(current_middle)}/111")
    print(f"- zero core gaps: {len(zero_easy)}")
    print(f"- zero precision gaps: {len(zero_normal)}")
    print(f"- missing manual gap terms: {len(missing_terms)}")
    print(f"- precision<core: {len(precision_less)}")
    print(f"- duplicate stable IDs: {len(dup_ids)}")
    if failures:
        print("\nFailures:")
        for failure in failures:
            print(f"  * {failure}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
