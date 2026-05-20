with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if ('Symbols' in line and 'action' in line) or ('Shapes' in line and ('action' in line or 'label' in line)):
        print(f'L{i+1}: {line.rstrip()[:160]}')
    if ('DESIGN' in line or 'PACKAGE' in line or 'TOOLS' in line) and 'tracking-widest' in line and i > 2100:
        print(f'L{i+1}: {line.rstrip()[:160]}')
