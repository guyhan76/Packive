with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()
count = src.count('finalPdf')
print(f'finalPdf refs: {count}')
src = src.replace('finalPdf', 'rawPdf')
with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Replaced {count} refs with rawPdf')
