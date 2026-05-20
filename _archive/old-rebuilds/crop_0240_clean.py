import fitz
from PIL import Image
import io

doc = fitz.open('fefco_code.pdf')
page = doc[28]
mat = fitz.Matrix(3, 3)
pix = page.get_pixmap(matrix=mat)
img = Image.open(io.BytesIO(pix.tobytes('png')))

# 텍스트 위치에서 3D 박스 영역 정밀 계산
# 0240: title at y=60, "NEW" at y=88 x=524
# "v" at y=133 x=463 (행거 상단)
# "H" at y=204 x=430 (박스 본체)
# "L" at y=264 x=451, "W" at y=269 x=508 (박스 하단)
# 3D 박스는 v(y=133)에서 W(y=269) 사이, x=430~540
# 스케일 3x -> y=399~807, x=1290~1620
# 여유 포함 + 텍스트(v,H,L,W) 제외하고 박스만

scale = 3
# 3D 박스 본체만: NEW 아래, 텍스트 라벨 안쪽
crop = img.crop((1320, 360, 1640, 810))
crop.save('test_0240_precise.png')
print(f'Precise crop: {crop.size[0]}x{crop.size[1]}')

# 흰색 배경으로 정리 - 상단 선 제거
from PIL import ImageDraw
draw = ImageDraw.Draw(crop)
# 상단 가로선 영역을 흰색으로 덮기
for y in range(crop.size[1]):
    for x in range(crop.size[0]):
        px = crop.getpixel((x, y))
        # NEW 텍스트 (청록색 0,169,206) 제거
        if px[0] < 50 and px[1] > 130 and px[2] > 170:
            crop.putpixel((x, y), (255, 255, 255))

# 상단 40px 내의 검은 수평선 제거
for y in range(40):
    for x in range(crop.size[0]):
        px = crop.getpixel((x, y))
        if px[0] < 100 and px[1] < 100 and px[2] < 100:
            crop.putpixel((x, y), (255, 255, 255))

crop.save('public/dielines/box3d/ecma-a55-hanger.png')
print('ecma-a55-hanger.png updated (clean)')

import os
size_kb = os.path.getsize('public/dielines/box3d/ecma-a55-hanger.png') / 1024
print(f'File size: {size_kb:.1f} KB')
