with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Find where font is applied to text object
# Look for setFont or set("fontFamily" patterns
lines = src.split('\n')
for i, line in enumerate(lines):
    if ('fontFamily' in line and ('set(' in line or '.set(' in line)) and i > 3000:
        print(f'L{i+1}: {line.rstrip()[:160]}')
    if 'initDimensions' in line or 'setCoords' in line:
        if i > 3000:
            print(f'L{i+1}: {line.rstrip()[:160]}')
