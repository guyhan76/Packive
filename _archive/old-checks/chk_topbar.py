with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Top bar full content (L2040-L2210)
for i in range(2039, min(2215, len(lines))):
    ln = lines[i].rstrip()
    if ln.strip():  # skip empty lines
        print(f"L{i+1}: {ln[:180]}")
