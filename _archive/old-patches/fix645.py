with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

fixes = 0

old1 = 'if (isReverseLUTReady()) {'
new1 = 'if (cmykEngine?.isReverseLUTReady()) {'
if old1 in src:
    src = src.replace(old1, new1)
    fixes += 1
    print('Fix1: isReverseLUTReady -> cmykEngine?.isReverseLUTReady()')

old2 = 'rawPdf = convertImageXObjectsToCMYK(rawPdf);'
new2 = 'rawPdf = convertImageXObjectsToCMYK(rawPdf, cmykEngine);'
if old2 in src:
    src = src.replace(old2, new2)
    fixes += 1
    print('Fix2: pass cmykEngine to convertImageXObjectsToCMYK')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)

print(f'Total fixes: {fixes}')

with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    v = f.read()
for i, line in enumerate(v.split('\n')):
    if 'isReverseLUTReady' in line:
        print(f'L{i+1}: {line.rstrip()[:150]}')
