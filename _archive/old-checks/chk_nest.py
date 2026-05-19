with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print L2185-L2210 to see JSX nesting
for i in range(2184, min(2210, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()}")
