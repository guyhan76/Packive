with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find where panelMap/panelToCanvas is used to draw on canvas
for i, line in enumerate(lines):
    if any(k in line for k in ['panelToCanvas', 'panelMap', 'setPanelMapData', 'generatePanelMap', 'detectPanels']):
        print(f"L{i+1}: {line.rstrip()[:200]}")

print("\n=== Where dimension text/lines are added to canvas ===")
for i, line in enumerate(lines):
    ln = line.lower()
    if ('_ispanellabel' in ln or '_ispaneloverlay' in ln) and ('add(' in ln or 'set(' in ln or 'new ' in ln or 'true' in ln):
        print(f"L{i+1}: {line.rstrip()[:200]}")
