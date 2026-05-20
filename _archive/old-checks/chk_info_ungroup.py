with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# 1. Info button (L2060)
print("=== INFO BUTTON ===")
for i in range(2058, min(2063, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()}")

# 2. Ungroup button (L2062)
print("\n=== UNGROUP BUTTON ===")
for i in range(2061, min(2064, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()}")

# 3. Find info panel modal (bottom-left)
print("\n=== INFO MODAL ===")
for i, line in enumerate(lines):
    if 'dielineInfoVisible' in line or '_isDielineInfo' in line:
        print(f"L{i+1}: {line.rstrip()[:180]}")

# 4. Find dimension arrows / measurement display
print("\n=== DIMENSION ARROWS ===")
for i, line in enumerate(lines):
    if any(k in line for k in ['dimension', 'arrow', 'dimLine', 'panelLabel', '_isPanelLabel']):
        print(f"L{i+1}: {line.rstrip()[:180]}")
