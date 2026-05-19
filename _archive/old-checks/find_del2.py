with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Show L2190-2230 to see Delete and Picker area
for i in range(2190, min(2235, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:160]}')
