with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find the dieline generation code - where SVG is created and added to canvas
# Look for the area around L2950-3010 where the generated dieline is loaded
for i in range(2920, min(3015, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()[:200]}")
