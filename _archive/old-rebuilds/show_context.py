with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show context around L2517
for i in range(2510, 2530):
    print(f'L{i+1}: {lines[i].rstrip()[:140]}')
