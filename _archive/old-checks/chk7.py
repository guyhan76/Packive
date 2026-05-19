with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'symbol' in line.lower() and ('Panel' in line or 'Symbols' in line or 'showSymbol' in line):
        print(f'L{i+1}: {line.rstrip()[:160]}')
