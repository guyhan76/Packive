with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print full lines for Full Cut and Half Cut buttons
for i in range(2479, min(2488, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:300]}')
