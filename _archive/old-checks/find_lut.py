with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'isReverseLUTReady' in line:
        print(f'L{i+1}: {line.rstrip()[:180]}')
