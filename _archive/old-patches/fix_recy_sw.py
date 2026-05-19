with open('public/symbols/21_recycle2.svg', 'r', encoding='utf-8') as f:
    content = f.read()

import re
scale = re.search(r'scale\(([\d.]+)\)', content)
print(f"Scale: {scale.group(1) if scale else 'none'}")

# Current border: stroke-width="3" with scale 3.5246 = 10.57px
# Target: match other symbols ~9.2px (scale 0.8428 * sw 11 = 9.27)
# For scale 3.5246: need sw = 9.27 / 3.5246 = 2.63 -> round to 2.6
content = content.replace(
    '<rect x="0" y="0" width="51.1" height="50.2" fill="none" stroke="#231815" stroke-width="3"/>',
    '<rect x="0" y="0" width="51.1" height="50.2" fill="none" stroke="#231815" stroke-width="2.6"/>'
)

with open('public/symbols/21_recycle2.svg', 'w', encoding='utf-8') as f:
    f.write(content)
print("FIXED: 21_recycle2.svg stroke-width 3 -> 2.6")
