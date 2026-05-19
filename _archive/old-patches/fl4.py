with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i in range(2920, min(2935, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:140]}')
