# 별자리 이음선 별 → 거리(광년) 데이터 생성: depth-data.js (3D 깊이 보기용)
# 사용법: python3 tools/build_depth_data.py <hygdata_v41.csv>
#   HYG Database v4.1 (CC BY-SA 4.0): https://github.com/astronexus/HYG-Database  (hyg/CURRENT/hygdata_v41.csv)
# 입력: HYG csv, index.html 의 SKY_LINES·대표 별 표기 → 출력: 저장소 루트의 depth-data.js
import csv, json, re, math, sys

import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + os.sep
HYG_CSV = sys.argv[1] if len(sys.argv) > 1 else 'hygdata_v41.csv'

html = open(ROOT + 'index.html', encoding='utf-8').read()
LINES = json.loads(re.search(r'const SKY_LINES=(\{.*?\});', html, re.S).group(1))

# ── 한글 별 이름: 앱 표기 우선 → 표준 표기 보강 ───────────────────────────
app = {}
for m in re.finditer(r'star:"([^"]+)"', html):          # 앱이 쓰는 대표 별 표기: "알페라츠 (Alpheratz, α, 2.1등급)"
    for part in re.finditer(r"([가-힣][가-힣 ·]*?)\s*\(([A-Za-z][A-Za-z' \-]*?)\s*[,)]", m.group(1)):
        app.setdefault(part.group(2).strip(), part.group(1).strip())
app.pop('Alrescha', None)          # 앱 표기가 일반 표기와 달라 바이어 명칭으로 대체
EXTRA = {
 'Betelgeuse': '베텔게우스', 'Bellatrix': '벨라트릭스', 'Alnilam': '알닐람', 'Alnitak': '알니탁', 'Mintaka': '민타카',
 'Saiph': '사이프', 'Meissa': '메이사', 'Mirzam': '미르잠', 'Adhara': '아다라', 'Wezen': '웨젠', 'Aludra': '알루드라',
 'Furud': '푸루드', 'Muliphein': '물리페인', 'Dubhe': '두베', 'Merak': '메라크', 'Phecda': '페크다', 'Megrez': '메그레즈',
 'Mizar': '미자르', 'Alkaid': '알카이드', 'Caph': '카프', 'Ruchbah': '루크바', 'Segin': '세긴', 'Shaula': '샤울라',
 'Sargas': '사르가스', 'Dschubba': '주바', 'Acrab': '아크라브', 'Albireo': '알비레오', 'Sadr': '사드르', 'Sheliak': '셸리악',
 'Sulafat': '술라파트', 'Tarazed': '타라제드', 'Alshain': '알샤인', 'Denebola': '데네볼라', 'Algieba': '알기에바',
 'Zosma': '조스마', 'Kochab': '코카브', 'Algol': '알골', 'Mirach': '미라크', 'Almach': '알마크', 'Markab': '마르카브',
 'Scheat': '셰아트', 'Menkar': '멘카르', 'Hadar': '하다르', 'Miaplacidus': '미아플라키두스', 'Avior': '아비오르',
 'Aspidiske': '아스피디스케', 'Mimosa': '미모사', 'Gacrux': '가크룩스', 'Elnath': '엘나트', 'Alhena': '알헤나',
 'Menkalinan': '멘칼리난', 'Mebsuta': '메브수타', 'Castor': '카스토르', 'Wasat': '와사트', 'Alzirr': '알지르',
 'Gomeisa': '고메이사', 'Alphecca': '알페카', 'Nekkar': '네카르', 'Seginus': '세기누스', 'Izar': '이자르',
 'Muphrid': '무프리드', 'Zubenelgenubi': '주벤엘게누비', 'Sabik': '사비크', 'Rasalgethi': '라스알게티',
 'Sarin': '사린', 'Rastaban': '라스타반', 'Thuban': '투반', 'Edasich': '에다시크', 'Altais': '알타이스',
 'Aldhibah': '알디바', 'Pherkad': '페르카드', 'Yildun': '일둔', 'Nunki': '눈키', 'Ascella': '아셀라',
 'Kaus Media': '카우스 메디아', 'Kaus Borealis': '카우스 보레알리스', 'Albaldah': '알발다', 'Sadalmelik': '사달멜리크',
 'Sadachbia': '사다크비아', 'Nashira': '나시라', 'Alkes': '알케스', 'Algorab': '알고랍', 'Diadem': '디아뎀',
 'Porrima': '포리마', 'Vindemiatrix': '빈데미아트릭스', 'Heze': '헤제', 'Zaniah': '자니아', 'Syrma': '시르마',
 'Zavijava': '자비자바', 'Acamar': '아카마르', 'Zaurak': '자우라크', 'Cursa': '쿠르사', 'Adhafera': '아드하페라',
 'Rasalas': '라살라스', 'Chertan': '체르탄', 'Mahasim': '마하심', 'Menkib': '멘키브', 'Propus': '프로푸스',
 'Tejat': '테자트', 'Mekbuda': '메크부다', 'Alnasl': '알나슬', 'Menkent': '멘켄트', 'Alpherg': '알페르그',
 'Algenib': '알게니브', 'Mothallah': '모탈라', 'Mesarthim': '메사르팀', 'Sheratan': '셰라탄', 'Baten Kaitos': '바텐 카이토스',
 'Mira': '미라', 'Deneb Kaitos': '디프다', 'Hassaleh': '하살레', 'Haedus': '하이두스', 'Almaaz': '알마아즈',
 'Saclateni': '사클라테니', 'Ain': '아인', 'Alcyone': '알키오네', 'Tania Australis': '타니아 아우스트랄리스',
 'Tania Borealis': '타니아 보레알리스', 'Alula Australis': '알룰라 아우스트랄리스', 'Alula Borealis': '알룰라 보레알리스',
 'Kraz': '크라즈', 'Dabih': '다비흐', 'Ancha': '안차', 'Arkab Prior': '아르카브 프리어', 'Alniyat': '알니야트',
 'Lesath': '레사트', 'Yed Prior': '예드 프리어', 'Yed Posterior': '예드 포스테리어', 'Alya': '알리아',
 'Menkar': '멘카르', 'Hassaleh': '하살레', 'Ras Elased Australis': '라스 엘라세드 아우스트랄리스',
 'Prima Hyadum': '프리마 히아둠', 'Secunda Hyadum': '세쿤다 히아둠', 'Alkaphrah': '알카프라', 'Okab': '오카브',
 'Tureis': '투레이스', 'Asellus Australis': '아셀루스 아우스트랄리스', 'Asellus Borealis': '아셀루스 보레알리스',
 'Acubens': '아쿠벤스', 'Meridiana': '메리디아나', 'Crux': '크룩스',
}
KO = dict(EXTRA); KO.update(app)   # 앱 표기가 우선

# 카탈로그 값이 최신 연구값과 크게 어긋나는 유명한 별만 출처를 밝히고 보정한다.
# Deneb: Hipparcos 시차가 불안정(HYG 1,412ly). Schiller & Przybilla (2008) 802±66 pc ≈ 2,600 ly.
OVERRIDE_LY = {'Deneb': 2600}

GREEK = {'Alp': 'α', 'Bet': 'β', 'Gam': 'γ', 'Del': 'δ', 'Eps': 'ε', 'Zet': 'ζ', 'Eta': 'η', 'The': 'θ', 'Iot': 'ι',
         'Kap': 'κ', 'Lam': 'λ', 'Mu': 'μ', 'Nu': 'ν', 'Xi': 'ξ', 'Omi': 'ο', 'Pi': 'π', 'Rho': 'ρ', 'Sig': 'σ',
         'Tau': 'τ', 'Ups': 'υ', 'Phi': 'φ', 'Chi': 'χ', 'Psi': 'ψ', 'Ome': 'ω'}
SUP = {'1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'}

def designation(s):
    b = (s['bayer'] or '').strip()
    con = (s['con'] or '').strip()
    if b:
        m = re.match(r'^([A-Za-z]+)(?:-(\d))?$', b)
        if m and m.group(1) in GREEK:
            g = GREEK[m.group(1)] + (SUP.get(m.group(2), '') if m.group(2) else '')
            return f'{g} {con}'.strip()
    if s['flam']:
        return f"{s['flam'].strip()} {con}".strip()
    if s['hip']:
        return f"HIP {s['hip']}"
    if s['hd']:
        return f"HD {s['hd']}"
    return ''

# ── HYG 로드 ───────────────────────────────────────────────────────────
rows = []
with open(HYG_CSV, newline='') as f:
    for r in csv.DictReader(f):
        if r['id'] == '0':
            continue
        try:
            mag = float(r['mag'])
        except ValueError:
            continue
        if mag > 7.0:
            continue
        try:
            d = float(r['dist'])
        except ValueError:
            d = 100000.0
        try:
            ci = float(r['ci'])
        except ValueError:
            ci = None
        rows.append(dict(ra=float(r['ra']) * 15, dec=float(r['dec']), mag=mag, d=d, ci=ci,
                         proper=r['proper'], bayer=r['bayer'], flam=r['flam'], con=r['con'], hip=r['hip'], hd=r['hd']))

grid = {}
for s in rows:
    grid.setdefault((int(s['ra']) % 360, int(math.floor(s['dec']))), []).append(s)

def sep(ra1, d1, ra2, d2):
    ra1, d1, ra2, d2 = map(math.radians, (ra1, d1, ra2, d2))
    c = math.sin(d1) * math.sin(d2) + math.cos(d1) * math.cos(d2) * math.cos(ra1 - ra2)
    return math.degrees(math.acos(max(-1, min(1, c))))

def find(ra, dec):
    cs = []
    for dra in (-1, 0, 1):
        for dd in (-1, 0, 1):
            for s in grid.get(((int(ra) + dra) % 360, int(math.floor(dec)) + dd), []):
                a = sep(ra, dec, s['ra'], s['dec'])
                if a < 0.25:
                    cs.append((a, s))
    if not cs:
        return None
    cs.sort(key=lambda x: x[0])
    best = cs[0][0]
    near = [c for c in cs if c[0] <= best + 0.02]          # 같은 별(이중성 성분 포함) 후보
    near.sort(key=lambda c: c[1]['mag'])                   # 가장 밝은 성분 = 대표 이름·등급
    pick = near[0][1]
    # 이중성은 거리가 같으므로, 대표 성분에 거리가 없으면 다른 성분의 거리를 빌린다
    if pick['d'] >= 99999 or pick['d'] <= 0:
        for _, s in near:
            if 0 < s['d'] < 99999:
                pick = dict(pick, d=s['d'])
                break
    return pick

out = {}
stats = dict(vertices=0, unknown=0, korean=0, designated=0, blank=0)
for abbr in sorted(LINES):
    idx = {}
    stars = []
    plist = []
    for poly in LINES[abbr]:
        pl = []
        for ra, dec in poly:
            key = (round(ra, 2), round(dec, 2))
            if key not in idx:
                s = find(ra, dec)
                stats['vertices'] += 1
                if s and s['proper'] in OVERRIDE_LY:
                    ly = OVERRIDE_LY[s['proper']]
                elif s and 0 < s['d'] < 99999:
                    ly = round(s['d'] * 3.26156)
                else:
                    ly = 0
                    stats['unknown'] += 1
                mag = round(s['mag'], 2) if s else 4.5
                bv = round(s['ci'], 2) if (s and s['ci'] is not None) else 0.6
                nm = ''
                if s:
                    if s['proper'] in KO:
                        nm = KO[s['proper']]; stats['korean'] += 1
                    else:
                        nm = designation(s)
                        if nm: stats['designated'] += 1
                        else: stats['blank'] += 1
                idx[key] = len(stars)
                stars.append([round(ra, 2), round(dec, 2), ly, mag, bv, nm])
            pl.append(idx[key])
        plist.append(pl)
    known = sorted(x[2] for x in stars if x[2] > 0)
    med = known[len(known) // 2] if known else 300
    for x in stars:
        if x[2] == 0:
            x[2] = -med                                     # 음수 = 같은 별자리 중앙값으로 추정
    out[abbr] = {'s': stars, 'p': plist}

body = ',\n'.join(f'"{a}":{json.dumps(out[a], ensure_ascii=False, separators=(",", ":"))}' for a in sorted(out))
header = ('/* 별자리 이음선 별까지의 거리(광년) — 자동 생성 파일(수정 금지)\n'
          '   별 위치: 앱 내장 IAU 이음선 · 거리·등급·색지수: HYG Database v4.1 (astronexus, CC BY-SA 4.0; Hipparcos 시차)\n'
          '   보정: 데네브 2,600광년(Schiller & Przybilla 2008). 먼 별일수록 시차 오차가 커서 화면에는 반올림해 표시합니다.\n'
          '   s: [적경°, 적위°, 거리(광년; 음수=추정), 겉보기등급, B-V, 이름]  p: 이음선 폴리라인(s 의 인덱스) */\n')
js = header + 'window.SKY_DEPTH={\n' + body + '\n};\n'
open(ROOT + 'depth-data.js', 'w', encoding='utf-8').write(js)
print(stats)
print('constellations', len(out), '| bytes', len(js.encode()))
print('Ori', json.dumps(out['Ori']['s'][:4], ensure_ascii=False))
