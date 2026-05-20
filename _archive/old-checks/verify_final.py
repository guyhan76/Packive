with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('=== Final preview area L2503-2512 ===')
for i in range(2502, min(2513, len(lines))):
    line = lines[i].rstrip()[:250]
    print(f'L{i+1}: {line}')
