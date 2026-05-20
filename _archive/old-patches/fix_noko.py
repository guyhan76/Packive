with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

changes = 0

# Remove nameKo references in symbol panel
src = src.replace('sym.nameKo.includes(symbolSearch)', 'false')
changes += 1

src = src.replace('sym.name + " / " + sym.nameKo', 'sym.name')
changes += 1

# Fix category labels - remove nameKo
src = src.replace('{cat.nameKo}', '{cat.name}')
changes += 1

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Changes: {changes}")
print(f"Total lines: {len(src.splitlines())}")
