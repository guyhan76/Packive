import os, re

svg_dir = "public/symbols"
for fname in sorted(os.listdir(svg_dir)):
    if not fname.endswith(".svg"):
        continue
    fpath = os.path.join(svg_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Find outer rect (border)
    rects = re.findall(r'<rect[^/]*/>', content)
    if rects:
        # Get viewBox
        vb = re.search(r'viewBox="([^"]+)"', content)
        vb_str = vb.group(1) if vb else "?"
        # Get stroke-width from style
        sw_style = re.findall(r'stroke-width:\s*([0-9.]+)', content)
        sw_attr = re.findall(r'stroke-width="([0-9.]+)"', content)
        print(f"{fname}: vb={vb_str} style-sw={sw_style} attr-sw={sw_attr} rects={len(rects)}")
