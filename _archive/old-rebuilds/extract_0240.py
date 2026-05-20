import fitz
from PIL import Image
import io

doc = fitz.open('fefco_code.pdf')
page = doc[28]  # page 29, 0-indexed = 28
mat = fitz.Matrix(3, 3)
pix = page.get_pixmap(matrix=mat)
img_bytes = pix.tobytes('png')
img = Image.open(io.BytesIO(img_bytes))
w, h = img.size
print(f'Page 29: {w}x{h}')

# 0240은 페이지 상단에 있음 - 텍스트 위치 확인
blocks = page.get_text('dict')['blocks']
for b in blocks:
    if 'lines' in b:
        for line in b['lines']:
            for span in line['spans']:
                txt = span['text'].strip()
                if txt and len(txt) < 20:
                    bbox = span['bbox']
                    print(f'  y={bbox[1]:.0f} x={bbox[0]:.0f} text="{txt}"')
