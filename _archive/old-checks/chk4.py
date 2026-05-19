import re

files = ['1_glass.svg', '2_umbreller1.svg', '4_nife1.svg', '9_up.svg']
for fn in files:
    with open(f'public/symbols/{fn}', 'r', encoding='utf-8') as f:
        content = f.read()
    # Find scale in transform
    scale = re.search(r'scale\(([\d.]+)\)', content)
    # Find all stroke-width
    style_sw = re.findall(r'stroke-width\s*:\s*([\d.]+)', content)
    attr_sw = re.findall(r'stroke-width="([\d.]+)"', content)
    print(f"{fn}: scale={scale.group(1) if scale else 'none'}, style-sw={style_sw}, attr-sw={attr_sw}")
