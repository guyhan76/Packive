with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show the area after CMYK replacement (L570-595) to understand the PDF post-processing flow
for i in range(569, min(595, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:180]}')

print()
print('=== imports ===')
for i, line in enumerate(lines):
    if 'import' in line and i < 30:
        print(f'L{i+1}: {line.rstrip()[:180]}')
