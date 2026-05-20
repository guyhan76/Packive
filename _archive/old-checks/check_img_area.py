with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show L305 ~ L355 (image pre-processing area)
for i in range(304, min(360, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:180]}')
