with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Find the symbol panel div and change top position
old = 'showSymbolPanel && (\n            <div className="absolute left-14 top-1'
new = 'showSymbolPanel && (\n            <div className="absolute left-14 top-16'

if old in src:
    src = src.replace(old, new)
    print('Changed top-1 to top-16')
else:
    # Try without newline variations
    if 'showSymbolPanel' in src and 'top-1' in src:
        src = src.replace('absolute left-14 top-1 z-30', 'absolute left-14 top-16 z-30')
        print('Changed top-1 to top-16 (alt)')
    else:
        print('ERROR: pattern not found')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
