from PIL import Image
import urllib.request
import io

# 사용자가 캡처한 깨끗한 이미지 다운로드
url = 'https://www.genspark.ai/api/files/s/4sCKoVw9'
urllib.request.urlretrieve(url, 'temp_hanger.png')

img = Image.open('temp_hanger.png')
print(f'Downloaded: {img.size[0]}x{img.size[1]}')

# 다른 카드와 동일한 캔버스 크기로 맞추기
ref = Image.open('public/dielines/box3d/fefco-0201.png')
target_w, target_h = ref.size
print(f'Target canvas: {target_w}x{target_h}')

canvas = Image.new('RGB', (target_w, target_h), (255, 255, 255))

# 이미지를 캔버스에 맞춰 비율 유지 축소
ratio = min(target_w * 0.85 / img.size[0], target_h * 0.85 / img.size[1])
new_w = int(img.size[0] * ratio)
new_h = int(img.size[1] * ratio)
resized = img.resize((new_w, new_h), Image.LANCZOS)

x = (target_w - new_w) // 2
y = (target_h - new_h) // 2
canvas.paste(resized, (x, y))
canvas.save('public/dielines/box3d/ecma-a55-hanger.png')
print(f'Final: {target_w}x{target_h}, box: {new_w}x{new_h}')

import os
kb = os.path.getsize('public/dielines/box3d/ecma-a55-hanger.png') / 1024
print(f'Size: {kb:.1f} KB')
