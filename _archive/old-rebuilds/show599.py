with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i in range(594, min(605, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:200]}')
