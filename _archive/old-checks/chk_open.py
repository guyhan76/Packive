with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print L2040-L2090 to see header opening structure
for i in range(2039, min(2095, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()}")
