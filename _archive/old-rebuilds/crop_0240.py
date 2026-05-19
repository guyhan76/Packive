import fitz
from PIL import Image
import io

doc = fitz.open('fefco_code.pdf')
page = doc[28]
mat = fitz.Matrix(3, 3)
pix = page.get_pixmap(matrix=mat)
img = Image.open(io.BytesIO(pix.tobytes('png')))
w, h = img.size
print(f'Page 29: {w}x{h}')

# 0240: title y=60, 3D right side
# PDF coords * 3 = render coords
# 0240 area: y=60~300, 3D right: x=350~570, y=80~280
scale = 3
crop = img.crop((350*scale, 70*scale, 570*scale, 280*scale))
crop.save('public/dielines/box3d/fefco-0240.png')
print(f'fefco-0240.png: {crop.size[0]}x{crop.size[1]} saved')

# ECMA A55.21.01.03에 복사
import shutil
shutil.copy('public/dielines/box3d/fefco-0240.png', 'public/dielines/box3d/ecma-a55-hanger.png')
print('ecma-a55-hanger.png updated')
