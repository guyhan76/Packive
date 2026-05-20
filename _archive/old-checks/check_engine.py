with open('src/lib/cmyk-engine.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()
print(f'Total lines: {len(lines)}')
for i, line in enumerate(lines):
    if any(kw in line.lower() for kw in ['export', 'function', 'rgbtocmyk', 'icc', 'lut', 'convert', 'reverse']):
        print(f'L{i+1}: {line.rstrip()[:180]}')
