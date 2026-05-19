with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Add counters for all shape types, not just images
old_counter = 'let imgCount = 1;'
new_counter = 'let imgCount = 1, rectCount = 1, circCount = 1, triCount = 1, ellCount = 1, polyCount = 1, lineCount = 1, pathCount = 1, grpCount = 1;'

if old_counter in src:
    src = src.replace(old_counter, new_counter)
    print('Fix1: Added shape counters')
else:
    print('Counter pattern not found')

# Update shape naming to include numbers
replacements = [
    ('return "Rectangle";', 'return "Rectangle " + (rectCount++);'),
    ('return "Circle";', 'return "Circle " + (circCount++);'),
    ('return "Triangle";', 'return "Triangle " + (triCount++);'),
    ('return "Ellipse";', 'return "Ellipse " + (ellCount++);'),
    ('return "Line";', 'return "Line " + (lineCount++);'),
    ('return "Polygon";', 'return "Polygon " + (polyCount++);'),
    ('return "Polyline";', 'return "Polyline " + (polyCount++);'),
    ('return o.name || "Path";', 'return o.name || ("Path " + (pathCount++));'),
    ('return "Group (" + (o._objects?.length || 0) + ")";', 'return "Group " + (grpCount++) + " (" + (o._objects?.length || 0) + ")";'),
]

count = 0
for old, new in replacements:
    if old in src:
        src = src.replace(old, new)
        count += 1

print(f'Fix2: Updated {count} shape names with counters')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
