with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Current symbol handler uses fixed scaleToWidth(80)
# Replace with dynamic scaling based on viewBox
old_scale = """group.scaleToWidth(80);"""

new_scale = """// Normalize: target 80px for a 213-unit viewBox (standard)
                        const vbMatch = sym.svg.match(/viewBox="[\\d.]+\\s+[\\d.]+\\s+([\\d.]+)\\s+([\\d.]+)"/);
                        const vbW = vbMatch ? parseFloat(vbMatch[1]) : 200;
                        const vbH = vbMatch ? parseFloat(vbMatch[2]) : 200;
                        const vbMax = Math.max(vbW, vbH);
                        const targetPx = 80;  // base size for 213-unit viewBox
                        const normalizedScale = targetPx * (vbMax / 213);
                        group.scaleToWidth(Math.min(normalizedScale, 150));"""

# Only replace the one inside the symbol handler (near sym.svg context)
# Find the symbol handler section
sym_idx = src.find("Symbol added to canvas:")
if sym_idx > -1:
    # Find the scaleToWidth(80) before this log
    search_start = max(0, sym_idx - 800)
    search_region = src[search_start:sym_idx]
    scale_pos = search_region.rfind(old_scale)
    if scale_pos > -1:
        abs_pos = search_start + scale_pos
        src = src[:abs_pos] + new_scale + src[abs_pos + len(old_scale):]
        print("FIXED: Symbol scaleToWidth now normalized by viewBox")
    else:
        print("ERROR: scaleToWidth(80) not found near symbol handler")
else:
    print("ERROR: Symbol handler marker not found")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
