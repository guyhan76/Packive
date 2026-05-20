with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find color/fill change handler in right panel
for i, line in enumerate(lines):
    ln = line.strip()
    # Look for fill color change logic
    if ('set(' in ln and 'fill' in ln.lower() and ('active' in lines[max(0,i-3):i+1][-1].lower() or 'selected' in ln.lower())) or \
       ('setFill' in ln) or \
       (('fill' in ln or 'stroke' in ln) and 'color' in ln.lower() and 'onChange' in ln):
        start = max(0, i-3)
        end = min(len(lines), i+5)
        for j in range(start, end):
            print(f"L{j+1}: {lines[j].rstrip()}")
        print("---")

# Also find where object color is applied
for i, line in enumerate(lines):
    if 'requestRenderAll' in line and 'fill' in lines[max(0,i-5):i+1][-1]:
        start = max(0, i-5)
        end = min(len(lines), i+2)
        for j in range(start, end):
            print(f"L{j+1}: {lines[j].rstrip()}")
        print("===")
