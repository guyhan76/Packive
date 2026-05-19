with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Show L2370-2400 to see the full structure
for i in range(2365, min(2405, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:160]}')
