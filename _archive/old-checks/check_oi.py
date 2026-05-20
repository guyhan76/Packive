with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find OutputIntent related code
for i, line in enumerate(lines):
    if 'OutputIntent' in line or 'outputintent' in line.lower() or 'catalog' in line.lower() or 'Type /Catalog' in line:
        print(f'L{i+1}: {line.rstrip()[:180]}')

print()
print('=== Step 7b area ===')
for i in range(588, min(610, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:180]}')
