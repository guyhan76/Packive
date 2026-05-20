with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find where addBleedGuides is called
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'addBleedGuides' in line:
        # Print surrounding context
        start = max(0, i-3)
        end = min(len(lines), i+4)
        for j in range(start, end):
            marker = '>>>' if j == i else '   '
            print(f'{marker} L{j+1}: {lines[j][:120]}')
        print()
