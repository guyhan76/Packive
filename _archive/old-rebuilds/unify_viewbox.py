import os, re

svgdir = "public/symbols"
TARGET = 200.0  # unified viewBox
skip_prefixes = ['39_','40_','41_','42_']  # handle SVGs
fixed = 0

for fn in sorted(os.listdir(svgdir)):
    if not fn.endswith('.svg'): continue
    if any(fn.startswith(s) for s in skip_prefixes): continue
    
    fp = os.path.join(svgdir, fn)
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    
    vb = re.search(r'viewBox="([^"]*)"', content)
    if not vb: continue
    parts = vb.group(1).split()
    ox, oy, ow, oh = float(parts[0]), float(parts[1]), float(parts[2]), float(parts[3])
    
    if abs(ow - TARGET) < 1 and abs(oh - TARGET) < 1:
        print(f"ok: {fn} (already ~200x200)")
        continue
    
    # Calculate scale to fit content into TARGET x TARGET
    content_max = max(ow, oh)
    scale = (TARGET * 0.9) / content_max  # 90% of target, 5% padding each side
    
    new_w = ow * scale
    new_h = oh * scale
    offset_x = (TARGET - new_w) / 2 - ox * scale
    offset_y = (TARGET - new_h) / 2 - oy * scale
    
    # Wrap existing content in a <g transform="...">
    # Find the closing </svg>
    svg_open_match = re.search(r'(<svg[^>]*>)', content)
    svg_close_idx = content.rfind('</svg>')
    
    if not svg_open_match or svg_close_idx < 0:
        print(f"SKIP: {fn} (no svg tags)")
        continue
    
    svg_open = svg_open_match.group(1)
    inner = content[svg_open_match.end():svg_close_idx]
    
    # Update viewBox in svg open tag
    new_svg_open = re.sub(r'viewBox="[^"]*"', f'viewBox="0 0 {TARGET} {TARGET}"', svg_open)
    # Remove width/height attributes if present (let viewBox control)
    new_svg_open = re.sub(r'\s+width="[^"]*"', '', new_svg_open)
    new_svg_open = re.sub(r'\s+height="[^"]*"', '', new_svg_open)
    
    new_content = f'{new_svg_open}\n<g transform="translate({offset_x:.2f},{offset_y:.2f}) scale({scale:.4f})">\n{inner}\n</g>\n</svg>'
    
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    fixed += 1
    print(f"FIXED: {fn} ({ow:.0f}x{oh:.0f} -> {TARGET:.0f}x{TARGET:.0f})")

print(f"\nTotal fixed: {fixed}")
