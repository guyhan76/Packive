with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show L560 ~ L593 (final PDF post-processing area)
for i in range(559, min(593, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:180]}')
