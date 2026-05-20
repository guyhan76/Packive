import os, re

svgdir = "public/symbols"
results = []
for fn in sorted(os.listdir(svgdir)):
    if not fn.endswith('.svg'): continue
    with open(os.path.join(svgdir, fn), 'r', encoding='utf-8') as f:
        content = f.read()
    # Get viewBox
    vb = re.search(r'viewBox="([^"]*)"', content)
    if not vb: continue
    parts = vb.group(1).split()
    vb_w, vb_h = float(parts[2]), float(parts[3])
    vb_size = min(vb_w, vb_h)
    # Get all stroke-width from style blocks
    style_sw = re.findall(r'stroke-width\s*:\s*([\d.]+)', content)
    # Get stroke-width attributes
    attr_sw = re.findall(r'stroke-width="([\d.]+)"', content)
    all_sw = style_sw + attr_sw
    if not all_sw: continue
    # Check if has border rect
    rects = re.findall(r'<rect[^>]*>', content)
    ratio = max(float(s) for s in all_sw) / vb_size * 100
    print(f"{fn}: vb={vb_size:.1f}, sw=[{','.join(all_sw)}], max_ratio={ratio:.1f}%, rects={len(rects)}")

