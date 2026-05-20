with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find shape/symbol panel popup
for i, line in enumerate(lines):
    if 'showShapePanel' in line or 'showSymbolPanel' in line:
        print(f"L{i+1}: {line.rstrip()[:180]}")

# Find panel containers with absolute/fixed positioning near left side
print("\n=== Panel popup positioning ===")
for i, line in enumerate(lines):
    if 'left: 56' in line or 'left: 60' in line or 'left:56' in line or 'left:60' in line or 'ml-14' in line:
        print(f"L{i+1}: {line.rstrip()[:200]}")

# Find z-index of panels
print("\n=== Panel z-index ===")
for i, line in enumerate(lines):
    if ('z-' in line or 'zIndex' in line) and i > 2200 and i < 3500:
        print(f"L{i+1}: {line.rstrip()[:200]}")

# Find infoObjs reference in upload handler
print("\n=== infoObjs ===")
for i, line in enumerate(lines):
    if 'infoObjs' in line:
        print(f"L{i+1}: {line.rstrip()[:200]}")
