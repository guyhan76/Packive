with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f'Total lines: {len(lines)}')

# Find image handling in PDF export
print('\n=== Image / CMYK conversion in PDF ===')
for i, line in enumerate(lines):
    if any(kw in line.lower() for kw in ['image', 'rgb', 'cmyk', 'icc', 'color', 'convert', 'raster', 'bitmap', 'dataurl', 'base64', 'fogra']):
        print(f'L{i+1}: {line.rstrip()[:180]}')
