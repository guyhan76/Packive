with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find lines around 2190-2205 to see the button pattern
for i in range(2185, min(2210, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:180]}')
