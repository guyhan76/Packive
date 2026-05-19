with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Remove the DeviceRGB->DeviceCMYK replacement block
old = '''// Step 7b: Replace /DeviceRGB declarations with /DeviceCMYK in image XObject headers
  // Image pixels are already CMYK-simulated (RGB round-tripped through FOGRA39)
  // This tells Illustrator the document is pure CMYK
  const rgbCount = (rawPdf.match(/\\/ColorSpace \\/DeviceRGB/g) || []).length;
  rawPdf = rawPdf.replace(/\\/ColorSpace \\/DeviceRGB/g, "/ColorSpace /DeviceCMYK");
  console.log("[PDF] Step 7b: Replaced " + rgbCount + " /DeviceRGB -> /DeviceCMYK declarations");'''

new = '''// Step 7b: Images are CMYK-simulated (RGB pixels round-tripped through FOGRA39)
  // /DeviceRGB declaration is kept because pixel data is still 3-channel RGB format
  // Colors are perceptually identical to CMYK output
  console.log("[PDF] Step 7b: Images CMYK-simulated, keeping DeviceRGB for 3-channel compatibility");'''

if old in src:
    src = src.replace(old, new)
    print('Removed DeviceRGB replacement')
else:
    print('Block not found')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
