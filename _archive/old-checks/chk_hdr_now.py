with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print full header area L2040-L2220
for i in range(2039, min(2220, len(lines))):
    ln = lines[i].rstrip()
    print(f"L{i+1}: {ln}")
