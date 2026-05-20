with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'CANVAS' in line and ('═' in line or 'canvas' in line.lower()) and i > 2000:
        print(f'L{i+1}: {line.rstrip()[:120]}')
    if 'leftTab === "barcode"' in line or 'leftTab === "image"' in line or 'leftTab === "shapes"' in line:
        print(f'L{i+1}: {line.rstrip()[:120]}')
