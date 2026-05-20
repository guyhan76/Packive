with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find exact symbol click handler area (around L2436-2460)
for i in range(2430, min(2465, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()}")
