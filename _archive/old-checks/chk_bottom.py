with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Keys button is at L2239-L2244, need to move it to bottom of left panel
# First find where the left toolbar div closes
for i in range(2244, min(2300, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()[:160]}")
