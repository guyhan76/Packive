with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Find the font apply in the font list button onClick
old_click = 'loadGoogleFont(f); updateProp("fontFamily", f); setSelectedFont(f); setFontDropOpen(fa'

# Find the full line
idx = src.find('loadGoogleFont(f); updateProp("fontFamily", f);')
if idx >= 0:
    # Get the line
    line_start = src.rfind('\n', 0, idx) + 1
    line_end = src.find('\n', idx)
    old_line = src[line_start:line_end]
    print(f'Found: {old_line.strip()[:120]}')
    
    # Replace: await loadGoogleFont first, then updateProp
    new_line = old_line.replace(
        'loadGoogleFont(f); updateProp("fontFamily", f);',
        'loadGoogleFont(f).then(() => { updateProp("fontFamily", f); setTimeout(() => updateProp("fontFamily", f), 500); }); '
    )
    src = src.replace(old_line, new_line)
    print('Updated to await font load before applying')
else:
    print('Pattern not found')

# Also increase the width multiplier for safety
old_width = 'const newW = measured.width + 20;'
new_width = 'const newW = measured.width * 1.3 + 30;'
if old_width in src:
    src = src.replace(old_width, new_width)
    print('Increased width safety margin')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
