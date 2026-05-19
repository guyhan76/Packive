import fitz
from PIL import Image
import io

doc = fitz.open('fefco_code.pdf')
page = doc[17]
mat = fitz.Matrix(3, 3)
pix = page.get_pixmap(matrix=mat)
png_data = pix.tobytes('png')
img = Image.open(io.BytesIO(png_data))
print(f'Page 18: {img.size[0]}x{img.size[1]}')

s = 3
crops = [
    ('0200', (350*s, 100*s, 575*s, 280*s)),
    ('0201', (350*s, 355*s, 575*s, 540*s)),
    ('0202', (350*s, 610*s, 575*s, 790*s)),
]

for code, box in crops:
    crop = img.crop(box)
    fname = f'test_3d_{code}.png'
    crop.save(fname)
    print(f'{code}: {crop.size[0]}x{crop.size[1]} saved as {fname}')
