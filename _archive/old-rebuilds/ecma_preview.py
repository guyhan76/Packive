import fitz
from PIL import Image
import io

doc = fitz.open('ecma_code.pdf')
mat = fitz.Matrix(2, 2)

# 처음 10페이지와 중간 부분 렌더링해서 확인
for pg in [1, 2, 3, 10, 20, 30, 40, 50, 60, 70, 80, 90]:
    if pg > len(doc):
        continue
    page = doc[pg - 1]
    pix = page.get_pixmap(matrix=mat)
    pix.save(f'ecma_p{pg}.png')
    print(f'Page {pg}: {pix.width}x{pix.height} saved')
