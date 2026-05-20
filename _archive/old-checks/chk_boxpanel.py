with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find Box Structure / dieline panel
for i, line in enumerate(lines):
    if any(k in line for k in ['Box Structure', 'showDielinePanel', 'box3d', 'FEFCO 0200', 'Slotted-type', 'Regular Slotted']):
        print(f"L{i+1}: {line.rstrip()[:160]}")
