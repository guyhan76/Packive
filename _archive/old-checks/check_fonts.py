with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Find googleFonts array
idx = src.find('googleFonts')
if idx >= 0:
    # Find the array definition
    for i, line in enumerate(src.split('\n')):
        if 'googleFonts' in line and ('=' in line or 'const' in line):
            print(f'L{i+1}: {line[:200]}')
            # Print next few lines
            lines = src.split('\n')
            for j in range(i+1, min(i+10, len(lines))):
                print(f'L{j+1}: {lines[j][:200]}')
            break

# Also find koFonts
for i, line in enumerate(src.split('\n')):
    if 'koFonts' in line and ('=' in line or 'const' in line) and 'filter' not in line and 'category' not in line:
        print(f'\nL{i+1}: {line[:200]}')
        lines = src.split('\n')
        for j in range(i+1, min(i+5, len(lines))):
            print(f'L{j+1}: {lines[j][:200]}')
        break
