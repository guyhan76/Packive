with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find where fontFamily is set on text objects (font selection handler)
for i, line in enumerate(lines):
    if 'fontFamily' in line and 'set(' in line and 'textbox' not in line.lower():
        if i > 3400 and i < 3700:
            print(f'L{i+1}: {line.rstrip()[:160]}')

print()
# Find loadGoogleFont callback and font apply
for i, line in enumerate(lines):
    if 'loadGoogleFont' in line and 'then' in line:
        for j in range(i, min(i+15, len(lines))):
            print(f'L{j+1}: {lines[j].rstrip()[:160]}')
        print()
