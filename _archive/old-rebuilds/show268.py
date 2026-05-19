with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(265, min(275, len(lines))):
    print(f'L{i+1}: {repr(lines[i][:100])}')
