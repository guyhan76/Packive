with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i in range(3676, min(3695, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:160]}')
