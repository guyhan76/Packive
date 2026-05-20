with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'symbolSearch' in line and 'useState' in line:
        print(f'L{i+1}: {line.rstrip()[:160]}')
    if 'symbolCategory' in line and 'useState' in line:
        print(f'L{i+1}: {line.rstrip()[:160]}')
