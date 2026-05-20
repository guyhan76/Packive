with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# 1. Check New button - does it reset dielineSizes?
print("=== NEW BUTTON (L2056-2058) ===")
for i in range(2055, min(2059, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()}")

# 2. Find dielineSizes state
print("\n=== dielineSizes STATE ===")
for i, line in enumerate(lines):
    if 'dielineSizes' in line and ('useState' in line or 'setDielineSizes' in line):
        print(f"L{i+1}: {line.rstrip()[:200]}")

# 3. Find dielineModelInfo state
print("\n=== dielineModelInfo ===")
for i, line in enumerate(lines):
    if 'dielineModelInfo' in line and ('useState' in line or 'setDielineModelInfo' in line):
        print(f"L{i+1}: {line.rstrip()[:200]}")

# 4. Check Ungroup - what flags does the dieline group have?
print("\n=== DIELINE GROUP FLAGS ===")
for i, line in enumerate(lines):
    if 'group.set(' in line and ('_isDieLine' in line or '_isGuideLayer' in line):
        print(f"L{i+1}: {line.rstrip()[:200]}")

# 5. Panel overlay objects
print("\n=== _isPanelOverlay / _isPanelLabel ===")
for i, line in enumerate(lines):
    if '_isPanelOverlay' in line or '_isPanelLabel' in line:
        if 'set(' in line or 'true' in line or 'visible' in line or 'filter' in line:
            print(f"L{i+1}: {line.rstrip()[:200]}")
