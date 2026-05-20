with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# 1. Remove the jsPDF internal OutputIntent block (doesn't work)
oi_start = src.find('// Add CMYK OutputIntent to suppress')
if oi_start >= 0:
    # Find the end: console.log line
    oi_end = src.find('console.log("[PDF] OutputIntent', oi_start)
    if oi_end > 0:
        oi_end = src.find('\n', oi_end) + 1
        # Also remove the closing brace
        next_brace = src.find('}', oi_end)
        if next_brace > 0 and next_brace < oi_end + 10:
            oi_end = next_brace + 1
    else:
        oi_end = src.find('}', src.find('console.log("[PDF] OutputIntent', oi_start) if src.find('console.log("[PDF] OutputIntent', oi_start) > 0 else oi_start + 500)
    
    # Simpler: find from comment to the end of the if block
    block_start = src.rfind('\n', 0, oi_start) + 1
    # Find matching closing brace for the if(pdfInternal)
    depth = 0
    block_end = oi_start
    started = False
    for i in range(oi_start, min(oi_start + 1000, len(src))):
        if src[i] == '{': depth += 1; started = True
        elif src[i] == '}':
            depth -= 1
            if started and depth == 0:
                block_end = src.find('\n', i) + 1
                break
    
    src = src[:block_start] + src[block_end:]
    print('Removed old OutputIntent block')

# 2. Add PDF raw string post-processing to inject OutputIntent into Catalog
# Find the CMYK color replacement step and add after it
anchor = '// Step 7b: Vector colors converted to CMYK'
idx = src.find(anchor)
if idx >= 0:
    line_end = src.find('\n', idx) + 1
    
    inject = '''  // Step 7b-2: Inject CMYK OutputIntent into PDF Catalog to suppress Illustrator dialog
  // Find /Type /Catalog and add /OutputIntents array
  const catIdx = rawPdf.indexOf("/Type /Catalog");
  if (catIdx >= 0) {
    const catEnd = rawPdf.indexOf(">>", catIdx);
    if (catEnd > catIdx && !rawPdf.substring(catIdx, catEnd).includes("/OutputIntents")) {
      const oiEntry = " /OutputIntents [<< /Type /OutputIntent /S /GTS_PDFX /OutputConditionIdentifier (FOGRA39) /RegistryName (http://www.color.org) /Info (FOGRA39) >>]";
      rawPdf = rawPdf.substring(0, catEnd) + oiEntry + rawPdf.substring(catEnd);
      console.log("[PDF] Step 7b-2: CMYK OutputIntent injected into Catalog");
    }
  }
'''
    src = src[:line_end] + inject + src[line_end:]
    print('Added OutputIntent injection in raw PDF')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
