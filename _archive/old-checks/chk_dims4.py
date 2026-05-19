with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find ALL references to panelMapData
for i, line in enumerate(lines):
    if 'panelMapData' in line:
        print(f"L{i+1}: {line.rstrip()[:200]}")

print("\n=== SVG overlay for dimensions ===")
# Find any SVG overlay that draws dimension lines
for i, line in enumerate(lines):
    if ('position' in line and 'absolute' in line and i > 3060 and i < 3200):
        print(f"L{i+1}: {line.rstrip()[:200]}")
