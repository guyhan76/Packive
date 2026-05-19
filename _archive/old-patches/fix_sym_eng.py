with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Fix 1: fabric is not defined -> use fabricModRef or window.__fabric
old_fabric = 'fabric.loadSVGFromString(sym.svg.replace(/currentColor/g, "#000000"), (objects: any[], options: any) => {\n                      const group = fabric.util.groupSVGElements(objects, options);'
if 'fabric.loadSVGFromString(sym.svg' in src:
    src = src.replace('fabric.loadSVGFromString(sym.svg', '((window as any).__fabric || fabricModRef.current).loadSVGFromString(sym.svg')
    src = src.replace('fabric.util.groupSVGElements(objects, options)', '((window as any).__fabric || fabricModRef.current).util.groupSVGElements(objects, options)')
    print('Fix1: Replaced fabric with fabricModRef')
else:
    print('fabric.loadSVGFromString pattern not found')

# Fix 2: Change nameKo to English name in symbol panel display
# Change {sym.nameKo} to {sym.name}
old_label = '{sym.nameKo}'
new_label = '{sym.name}'
if old_label in src:
    src = src.replace(old_label, new_label)
    print('Fix2: Changed symbol labels to English')

# Fix 3: Change category labels to English
old_cat = '{cat.nameKo}'
count = src.count(old_cat)
if count > 0:
    # Only replace in the symbol panel area, not font tabs
    # Find the symbol panel section
    sym_idx = src.find('Packaging Symbols')
    if sym_idx >= 0:
        # Find {cat.nameKo} after this point
        search_start = sym_idx
        pos = src.find(old_cat, search_start)
        if pos >= 0 and pos < sym_idx + 2000:
            src = src[:pos] + '{cat.name}' + src[pos+len(old_cat):]
            print('Fix3: Changed category labels to English in symbol panel')
    else:
        print('Packaging Symbols not found')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
