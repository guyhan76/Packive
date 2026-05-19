import os, re

svgdir = "public/symbols"
skip = ['39_','40_','41_','42_']

# Group by border presence
has_border = []
no_border = []

for fn in sorted(os.listdir(svgdir)):
    if not fn.endswith('.svg'): continue
    if any(fn.startswith(s) for s in skip): continue
    with open(os.path.join(svgdir, fn), 'r', encoding='utf-8') as f:
        content = f.read()
    vb = re.search(r'viewBox="([^"]*)"', content)
    if not vb: continue
    parts = vb.group(1).split()
    vb_w, vb_h = float(parts[2]), float(parts[3])
    
    # Check for border rect or polygon border
    rects = len(re.findall(r'<rect[^>]*>', content))
    polys = len(re.findall(r'<polygon[^>]*>', content))
    style_sw = re.findall(r'stroke-width\s*:\s*([\d.]+)', content)
    attr_sw = re.findall(r'stroke-width="([\d.]+)"', content)
    
    has_rect_border = rects > 0 and (style_sw or attr_sw)
    has_poly_border = polys > 0  # like umbreller1
    
    if has_rect_border or has_poly_border:
        has_border.append(f"{fn}: vb={min(vb_w,vb_h):.0f}, border=rect({rects})/poly({polys})")
    else:
        no_border.append(f"{fn}: vb={min(vb_w,vb_h):.0f}, NO BORDER")

print("=== HAS BORDER ===")
for x in has_border: print(f"  {x}")
print(f"\n=== NO BORDER ({len(no_border)}) ===")
for x in no_border: print(f"  {x}")
