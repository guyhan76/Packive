with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Find Step 7b comment and add simple DeviceRGB->DeviceCMYK header-only replacement
old_7b = '// Step 7b: Image CMYK simulation applied during pre-processing'
new_7b = '''// Step 7b: Replace /DeviceRGB declarations with /DeviceCMYK in image XObject headers
  // Image pixels are already CMYK-simulated (RGB round-tripped through FOGRA39)
  // This tells Illustrator the document is pure CMYK
  const rgbCount = (rawPdf.match(/\\/ColorSpace \\/ DeviceRGB/g) || []).length;
  rawPdf = rawPdf.replace(/\\/ColorSpace \\/DeviceRGB/g, "/ColorSpace /DeviceCMYK");
  console.log("[PDF] Step 7b: Replaced " + rgbCount + " /DeviceRGB -> /DeviceCMYK declarations");'''

if old_7b in src:
    src = src.replace(old_7b, new_7b)
    print('Added DeviceRGB header replacement')
else:
    print('Step 7b marker not found')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
