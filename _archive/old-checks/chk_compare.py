with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

import re

# Extract the full canvas SVG strings for Full Cut and Half Cut
# Full Cut
idx1 = src.find("Full Cut Handle")
block1 = src[max(0,idx1-600):idx1]
svg1_start = block1.rfind('const s = `')
svg1 = block1[svg1_start:]
svg1_end = svg1.find('`;')
print("=== Full Cut Canvas SVG ===")
print(svg1[:svg1_end+2])

print()

# Half Cut
idx2 = src.find("Half Cut Handle")
block2 = src[max(0,idx2-600):idx2]
svg2_start = block2.rfind('const s = `')
svg2 = block2[svg2_start:]
svg2_end = svg2.find('`;')
print("=== Half Cut Canvas SVG ===")
print(svg2[:svg2_end+2])

print()

# Also check scaleToWidth values
for m in re.finditer(r'scaleToWidth\((\d+)\)', src):
    line_num = src[:m.start()].count('\n') + 1
    if 2478 < line_num < 2510:
        print(f"L{line_num}: scaleToWidth({m.group(1)})")
