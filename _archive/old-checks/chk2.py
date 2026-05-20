with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find showSymbolPanel references
for i, line in enumerate(lines):
    if 'showSymbolPanel' in line:
        print(f'L{i+1}: {line.rstrip()[:160]}')
