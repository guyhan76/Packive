with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i in range(2210, min(2260, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()[:160]}")
