with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i in range(640, min(655, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:180]}')
