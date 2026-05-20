import fitz
from PIL import Image
import io

doc = fitz.open('fefco_code.pdf')
page = doc[28]
mat = fitz.Matrix(3, 3)
pix = page.get_pixmap(matrix=mat)
img = Image.open(io.BytesIO(pix.tobytes('png')))

# 페이지 전체를 먼저 저장해서 좌표 확인
img.save('test_page29_full.png')
print(f'Full page: {img.size[0]}x{img.size[1]}')

# 0240 3D는 오른쪽 상단 - 더 넓게 크롭
# 여러 크롭 시도
crops = [
    ('A', (1200, 150, 1700, 750)),
    ('B', (1100, 100, 1750, 800)),
    ('C', (1250, 180, 1680, 700)),
]
for name, box in crops:
    c = img.crop(box)
    c.save(f'test_0240_{name}.png')
    print(f'Crop {name}: {box} -> {c.size[0]}x{c.size[1]}')
