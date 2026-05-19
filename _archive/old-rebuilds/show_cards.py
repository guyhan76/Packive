with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show L2465 ~ L2550
for i in range(2464, min(2550, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:150]}')
