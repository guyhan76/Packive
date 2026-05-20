with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i in range(2215, min(2245, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()}")
