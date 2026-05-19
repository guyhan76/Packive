with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Show L2325-2380
for i in range(2324, min(2385, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:160]}')
