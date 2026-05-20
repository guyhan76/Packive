import os, re

svg_dir = "public/symbols"

# Target: border stroke should be ~5.15% of viewBox (11/213.54 = 0.0515)
TARGET_RATIO = 11.0 / 213.54

for fname in sorted(os.listdir(svg_dir)):
    if not fname.endswith(".svg"):
        continue
    fpath = os.path.join(svg_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    vb = re.search(r'viewBox="([^"]+)"', content)
    if not vb:
        continue
    parts = vb.group(1).split()
    vb_size = min(float(parts[2]), float(parts[3]))
    
    target_sw = round(vb_size * TARGET_RATIO, 2)
    
    old = content
    
    # Fix style stroke-widths that are border-related
    def fix_sw(match):
        val = float(match.group(1))
        # Border strokes: typically the largest stroke-width in the file
        # For vb~213: sw=11, for vb~72: sw=1.84 or 1.66
        # Normalize if it's the border stroke
        if val >= vb_size * 0.02:  # at least 2% of viewBox = likely border
            return f"stroke-width: {target_sw}"
        return match.group(0)
    
    content = re.sub(r'stroke-width:\s*([0-9.]+)', fix_sw, content)
    
    if content != old:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"FIXED: {fname} (vb={vb_size}, target_sw={target_sw})")
    else:
        print(f"ok: {fname} (vb={vb_size}, sw already={target_sw})")

print("\nRegenerate packaging-symbols.ts...")
