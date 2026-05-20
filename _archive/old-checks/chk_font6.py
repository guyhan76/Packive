with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'fontFamily' in line and i > 3400:
        print(f'L{i+1}: {line.rstrip()[:160]}')
