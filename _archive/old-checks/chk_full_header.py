with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print full header area L2040-2110
for i in range(2039, min(2110, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()[:250]}")
