with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

src = src.replace(
    'declarations"); (see below)',
    'declarations");'
)
print('Fixed L599')

# Also fix L597: regex has extra space "/ DeviceRGB" vs "/DeviceRGB"
src = src.replace(
    '/\\/ColorSpace \\/ DeviceRGB/g',
    '/\\/ColorSpace \\/DeviceRGB/g'
)
print('Fixed L597 regex')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)
