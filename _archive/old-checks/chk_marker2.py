with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if any(kw in line for kw in ['Table Popup', 'Barcode Popup', 'Symbols Popup', 'Packaging Symbols', 'Handle']):
        if 'Popup' in line or 'Panel' in line or 'Symbols' in line or 'Handle' in line:
            print(f'L{i+1}: {line.rstrip()[:140]}')
