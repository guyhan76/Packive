with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print L3000-3080 to see panel map generation and dimension drawing
for i in range(2999, min(3080, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()[:200]}")
