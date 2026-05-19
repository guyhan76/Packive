with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# 1. Info modal at L3065
print("=== INFO MODAL (L3060-3120) ===")
for i in range(3060, min(3120, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()[:200]}")

# 2. Where _isPanelLabel objects are created (dimension arrows/labels)
print("\n=== PANEL LABEL CREATION ===")
for i, line in enumerate(lines):
    if '_isPanelLabel' in line and ('set(' in line or 'true' in line.lower()):
        print(f"L{i+1}: {line.rstrip()[:200]}")

# 3. generatePanelMap function
print("\n=== GENERATE PANEL MAP ===")
for i, line in enumerate(lines):
    if 'generatePanelMap' in line or 'panelMap' in line:
        print(f"L{i+1}: {line.rstrip()[:200]}")
