with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print L2579-L2720 to see the full box panel
for i in range(2578, min(2720, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()[:200]}")
