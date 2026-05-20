with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show image preprocessing area (around L305-360)
for i in range(304, min(370, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:180]}')
