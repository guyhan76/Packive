import os, re

svgdir = "public/symbols"
# Skip handle SVGs
skip = ['39_','40_','41_','42_']

for fn in sorted(os.listdir(svgdir)):
    if not fn.endswith('.svg'): continue
    if any(fn.startswith(s) for s in skip): continue
    with open(os.path.join(svgdir, fn), 'r', encoding='utf-8') as f:
        content = f.read()
    vb = re.search(r'viewBox="([^"]*)"', content)
    if not vb: continue
    parts = vb.group(1).split()
    vb_w, vb_h = float(parts[2]), float(parts[3])
    print(f"{fn}: {vb_w:.1f} x {vb_h:.1f}")
