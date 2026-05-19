from PIL import Image

# 현재 이미지 로드
img = Image.open('public/dielines/box3d/ecma-a55-hanger.png')
print(f'Current: {img.size[0]}x{img.size[1]}')

# 다른 FEFCO 이미지 크기 확인
ref = Image.open('public/dielines/box3d/fefco-0201.png')
print(f'Reference (fefco-0201): {ref.size[0]}x{ref.size[1]}')

# 카드 비율 5:3 = 약 675x405
# 현재 이미지(320x450)를 675x405 캔버스 중앙에 배치
target_w, target_h = 675, 540
canvas = Image.new('RGB', (target_w, target_h), (255, 255, 255))

# 이미지를 캔버스 높이에 맞춰 축소
ratio = min(target_h * 0.85 / img.size[1], target_w * 0.6 / img.size[0])
new_w = int(img.size[0] * ratio)
new_h = int(img.size[1] * ratio)
resized = img.resize((new_w, new_h), Image.LANCZOS)

# 중앙 배치
x = (target_w - new_w) // 2
y = (target_h - new_h) // 2
canvas.paste(resized, (x, y))
canvas.save('public/dielines/box3d/ecma-a55-hanger.png')
print(f'Final: {target_w}x{target_h}, box: {new_w}x{new_h} at ({x},{y})')

import os
kb = os.path.getsize('public/dielines/box3d/ecma-a55-hanger.png') / 1024
print(f'Size: {kb:.1f} KB')
