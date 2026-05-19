import fitz
from PIL import Image
import io
import os

doc = fitz.open('fefco_code.pdf')

# 우리 25개 박스 중 FEFCO 18개 + ECMA는 별도 처리
# 페이지별 박스 코드와 순서
page_map = {
    18: ['0200','0201','0202'],
    19: ['0203','0204','0205'],
    21: ['0209','0210','0211'],
    22: ['0212','0214','0215'],
    23: ['0216','0217','0218'],
    25: ['0222','0225','0226'],
    32: ['0300','0301','0302'],
    33: ['0303','0304','0306'],
    35: ['0310','0312','0313'],
    45: ['0400','0401','0402'],
    47: ['0406','0407','0409'],
    51: ['0421','0422','0423'],
    53: ['0426','0427','0427.1'],
    76: ['0501','0502','0503'],
    92: ['0711','0712'],
    93: ['0713','0714'],
}

# 우리가 필요한 코드
needed = ['0201','0203','0210','0215','0216','0217','0225',
          '0301','0304','0310',
          '0401','0409','0421','0427',
          '0501','0503',
          '0711','0713']

# 출력 폴더
outdir = 'public/dielines/box3d'
os.makedirs(outdir, exist_ok=True)

s = 3  # scale factor
extracted = 0

for pg_num, codes in page_map.items():
    # 이 페이지에 필요한 코드가 있는지 확인
    page_needed = [c for c in codes if c in needed]
    if not page_needed:
        continue

    # 페이지 렌더링
    page = doc[pg_num - 1]
    mat = fitz.Matrix(s, s)
    pix = page.get_pixmap(matrix=mat)
    img = Image.open(io.BytesIO(pix.tobytes('png')))

    # 텍스트 블록에서 각 박스 코드의 Y 위치 찾기
    blocks = page.get_text('dict')['blocks']
    code_positions = {}
    for b in blocks:
        if 'lines' not in b:
            continue
        for line in b['lines']:
            for span in line['spans']:
                txt = span['text'].strip()
                if txt in codes and span['size'] > 15:
                    code_positions[txt] = span['bbox'][1]

    # Y 위치 기준으로 정렬
    sorted_codes = sorted(code_positions.items(), key=lambda x: x[1])
    print(f'Page {pg_num}: found {len(sorted_codes)} codes: {[c[0] for c in sorted_codes]}')

    for i, (code, y_start) in enumerate(sorted_codes):
        if code not in needed:
            continue

        # 다음 박스까지의 영역 또는 페이지 끝
        if i + 1 < len(sorted_codes):
            y_end = sorted_codes[i + 1][1]
        else:
            y_end = page.rect.height - 30  # 페이지 하단 여백 제외

        # 3D 이미지 크롭: 오른쪽 영역
        # x: 350~575 (PDF coords), y: y_start+40 ~ y_end-5
        crop_box = (
            int(350 * s),
            int((y_start + 40) * s),
            int(575 * s),
            int((y_end - 5) * s)
        )
        
        crop = img.crop(crop_box)
        fname = f'{outdir}/fefco-{code}.png'
        crop.save(fname)
        extracted += 1
        print(f'  {code}: y={y_start:.0f}~{y_end:.0f} -> {crop.size[0]}x{crop.size[1]} saved')

print(f'\nTotal extracted: {extracted}/{len(needed)}')

# 누락 확인
saved_files = os.listdir(outdir)
for code in needed:
    fname = f'fefco-{code}.png'
    if fname in saved_files:
        print(f'  OK: {fname}')
    else:
        print(f'  MISSING: {fname}')
