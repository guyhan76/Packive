with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show Preflight result modal (L4515 ~ L4600)
for i in range(4514, min(4600, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:180]}')
