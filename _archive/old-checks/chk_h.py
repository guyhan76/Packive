with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find current header
for i, line in enumerate(lines):
    if '{/* TOP BAR */}' in line:
        for j in range(i, min(i+80, len(lines))):
            print(f"L{j+1}: {lines[j].rstrip()[:180]}")
            if lines[j].strip() == '</div>' and j > i+5:
                # Check if next line is not part of header
                if j+1 < len(lines) and ('flex flex-1' in lines[j+1] or lines[j+1].strip() == ''):
                    print(f"--- Header ends at L{j+1} ---")
                    break
        break
