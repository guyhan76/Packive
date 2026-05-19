with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

src = src.replace('find("stream\n", ds)', 'find("stream\\x0A", ds)')
src = src.replace('find("stream\r\n", ds)', 'find("stream\\x0D\\x0A", ds)')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)

lines = src.split('\n')
for i, line in enumerate(lines):
    if 'streamKey' in line and 'find' in line:
        print(f'L{i+1}: {line.rstrip()[:150]}')
print('Done')
