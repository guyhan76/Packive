with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print L1966-L2050 to see the full updateProp function
for i in range(1965, min(2060, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()}")
