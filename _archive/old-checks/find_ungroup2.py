with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print L2075-2095 to find the ungroup button area
for i in range(2074, min(2095, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()[:250]}")
