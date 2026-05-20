with open('src/lib/panel-map.ts','r',encoding='utf-8') as f:
    content = f.read()

print(f"=== panel-map.ts ({len(content)} bytes) ===")
lines = content.split('\n')
for i, line in enumerate(lines):
    if any(k in line for k in ['panelToCanvas', '_isPanelLabel', '_isPanelOverlay', '_isDielineInfo', 'canvas.add', 'c.add', '.add(', 'set({', 'Label', 'Arrow', 'dimLine', 'dimension']):
        print(f"L{i+1}: {line.rstrip()[:200]}")
