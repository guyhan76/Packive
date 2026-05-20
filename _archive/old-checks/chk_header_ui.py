with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print header toolbar area L2050-2075
for i in range(2049, min(2075, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()[:200]}")
