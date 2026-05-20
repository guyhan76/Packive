import os, re

svg_dir = "public/symbols"
for fname in sorted(os.listdir(svg_dir)):
    if not fname.endswith(".svg"):
        continue
    fpath = os.path.join(svg_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Find stroke-width values
    widths = re.findall(r'stroke-width[:\s]*([0-9.]+)', content)
    # Find if has rect border (outer frame)
    has_rect = '<rect' in content and ('stroke' in content)
    
    if has_rect or widths:
        print(f"{fname}: stroke-widths={widths}, has_rect={has_rect}")
