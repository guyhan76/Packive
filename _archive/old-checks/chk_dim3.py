with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find where dieline info objects (dimensions, arrows) are tagged
for i, line in enumerate(lines):
    stripped = line.strip()
    if '_isDielineInfo' in stripped and ('true' in stripped or 'True' in stripped):
        print(f"L{i+1}: {stripped[:200]}")
    if '_isPanelLabel' in stripped and ('true' in stripped or 'True' in stripped):
        print(f"L{i+1}: {stripped[:200]}")

# Find SVG overlay for dimensions (the HTML overlay, not canvas objects)
print("\n=== SVG OVERLAY ===")
for i, line in enumerate(lines):
    if 'position: "absolute"' in line and i > 3000 and i < 3200:
        print(f"L{i+1}: {stripped[:200]}")
    if 'svg' in line.lower() and 'overlay' in line.lower():
        print(f"L{i+1}: {line.strip()[:200]}")
    if ('<line' in line or '<text' in line or '<marker' in line) and i > 3000:
        print(f"L{i+1}: {line.strip()[:200]}")
