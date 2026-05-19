with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find DielineTemplate definition and box3dPath assignment
for i, line in enumerate(lines):
    if any(k in line for k in ['DielineTemplate', 'box3dPath', 'svgPath', 'getTemplatesByCategory', 'BOX_CATEGORIES']):
        if i < 2579:  # Before the panel render
            print(f"L{i+1}: {line.rstrip()[:200]}")
