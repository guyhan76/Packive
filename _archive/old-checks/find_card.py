with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Find renderCard or the card button area
# Search for 'SVG preview' comment
for keyword in ['SVG preview', 'svgPath', 'title={', 'renderCard', 'box3dPath', 'iconSvg']:
    indices = []
    start = 0
    while True:
        idx = src.find(keyword, start)
        if idx == -1:
            break
        line_num = src[:idx].count('\n') + 1
        indices.append(line_num)
        start = idx + 1
    if indices:
        print(f'{keyword}: lines {indices}')

# Show the card preview area
lines = src.split('\n')
for i, line in enumerate(lines):
    if 'SVG preview' in line or ('svgPath' in line and 'img' in line):
        for j in range(max(0, i-3), min(len(lines), i+15)):
            print(f'L{j+1}: {lines[j].rstrip()[:140]}')
        print('---')
        break
