with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Fix 1: cat.label -> cat.nameKo (label doesn't exist in SYMBOL_CATEGORIES)
fixed = 0
if '{cat.label}' in src:
    src = src.replace('{cat.label}', '{cat.nameKo}')
    fixed += 1
    print('Fix1: cat.label -> cat.nameKo')

# Fix 2: Check where the panel is positioned - it should be inside the left sidebar area
# Find the panel location relative to other panels
lines = src.split('\n')
panel_line = None
for i, line in enumerate(lines):
    if 'showSymbolPanel && (' in line:
        panel_line = i + 1
        break
print(f'Symbol panel at L{panel_line}')

# Check where showBarcodePanel and showDielinePanel are to see the correct parent
for i, line in enumerate(lines):
    if 'showBarcodePanel && (' in line or 'showDielinePanel && (' in line or 'showTablePanel && (' in line:
        print(f'L{i+1}: {line.strip()[:120]}')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Fixed {fixed} issues, total lines: {len(lines)}')
