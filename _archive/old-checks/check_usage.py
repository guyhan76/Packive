with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Find how srgbToCmyk and isReverseLUTReady are used
for i, line in enumerate(src.split('\n')):
    if 'srgbToCmyk' in line or 'isReverseLUTReady' in line or '_cmykEngine' in line:
        print(f'L{i+1}: {line.rstrip()[:180]}')
