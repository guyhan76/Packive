with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Remove Symbols from PACKAGE section
old = '            { icon: "\u26A0", label: "Symbols", action: () => setShowSymbolPanel(p => !p) },\n'
if old in src:
    src = src.replace(old, '')
    print('Removed Symbols from PACKAGE section')
else:
    # Try without newline
    old2 = '{ icon: "\u26A0", label: "Symbols", action: () => setShowSymbolPanel(p => !p) },'
    if old2 in src:
        src = src.replace(old2 + '\n', '')
        print('Removed Symbols from PACKAGE (alt)')
    else:
        print('ERROR: Symbols button not found')

# Add Symbols after Shapes in DESIGN section
shapes_line = '{ icon: "\u25C6", label: "Shapes", action: () => setShowShapePanel(p => !p) },'
if shapes_line in src:
    src = src.replace(shapes_line, shapes_line + '\n            { icon: "\u26A0", label: "Symbols", action: () => setShowSymbolPanel(p => !p) },')
    print('Added Symbols after Shapes in DESIGN section')
else:
    print('ERROR: Shapes button not found')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
