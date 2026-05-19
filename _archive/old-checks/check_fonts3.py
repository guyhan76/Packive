with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.split('\n') if False else f.readlines()

# Find where Google Fonts API is called
for i, line in enumerate(lines):
    if 'fonts.googleapis.com' in line or 'google.*font' in line.lower() or 'webfonts' in line.lower():
        print(f'L{i+1}: {line.rstrip()[:200]}')

print()
# Find loadGoogleFont function
for i, line in enumerate(lines):
    if 'loadGoogleFont' in line and ('const' in line or 'function' in line or '=>' in line):
        for j in range(i, min(i+15, len(lines))):
            print(f'L{j+1}: {lines[j].rstrip()[:200]}')
        break

print()
# Find where googleFonts list is populated (setGoogleFonts)
for i, line in enumerate(lines):
    if 'setGoogleFonts' in line:
        print(f'L{i+1}: {line.rstrip()[:200]}')
