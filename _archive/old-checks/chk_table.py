with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'Table Popup' in line:
        print(f'L{i+1}: [{repr(line.rstrip())}]')
