with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Find where dimension lines/arrows are drawn on canvas for dieline
# Search for keywords related to dimension display
lines = content.split('\n')
for i, line in enumerate(lines):
    if any(k in line for k in ['dimLine', 'dimension', 'arrowHead', 'measureLine', 'labelText', 'panelLabel', 'addDimension', 'drawDimension', 'dimText']):
        print(f"L{i+1}: {line.rstrip()[:200]}")

print("\n=== panelToCanvas ===")
for i, line in enumerate(lines):
    if 'panelToCanvas' in line:
        print(f"L{i+1}: {line.rstrip()[:200]}")

print("\n=== Where sizes/arrows are added to canvas ===")
for i, line in enumerate(lines):
    if ('c.add(' in line or 'canvas.add(' in line) and any(k in line for k in ['label', 'dim', 'arrow', 'line', 'text']):
        print(f"L{i+1}: {line.rstrip()[:200]}")
