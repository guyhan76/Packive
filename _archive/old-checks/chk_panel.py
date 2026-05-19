with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find left panel button definitions
for i, line in enumerate(lines):
    if 'icon:' in line and 'label:' in line and 'action:' in line:
        print(f"L{i+1}: {line.strip()[:150]}")
