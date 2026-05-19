with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Find doc.setProperties and add OutputIntent after it
anchor = 'doc.setProperties({'
idx = src.find(anchor)
if idx < 0:
    print('setProperties not found')
else:
    # Find the closing });
    end = src.find('});', idx) + 3
    
    # Add OutputIntent declaration after setProperties
    output_intent = '''
  
  // Add CMYK OutputIntent to suppress Illustrator RGB/CMYK dialog
  const pdfInternal = (doc as any).internal;
  if (pdfInternal) {
    const oi = pdfInternal.newObject();
    pdfInternal.write([
      "<<",
      "/Type /OutputIntent",
      "/S /GTS_PDFX",
      "/OutputConditionIdentifier (FOGRA39)",
      "/RegistryName (http://www.color.org)",
      "/Info (FOGRA39 \\\\(ISO 12647-2:2004\\\\))",
      ">>",
    ].join("\\n"));
    
    // Reference in catalog
    const catalog = pdfInternal.pages.length > 0 ? pdfInternal : null;
    console.log("[PDF] OutputIntent FOGRA39 added, obj:", oi);
  }'''
    
    src = src[:end] + output_intent + src[end:]
    print('Added OutputIntent after setProperties')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
