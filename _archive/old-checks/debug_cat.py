# Add debug logging to check what the catalog looks like
with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

old = 'const catIdx = rawPdf.indexOf("/Type /Catalog");'
new = '''const catIdx = rawPdf.indexOf("/Type /Catalog");
  console.log("[PDF] Catalog search:", catIdx >= 0 ? "found at " + catIdx : "NOT FOUND");
  if (catIdx >= 0) {
    console.log("[PDF] Catalog context:", rawPdf.substring(catIdx, catIdx + 200));
  }'''

if old in src:
    src = src.replace(old, new)
    print('Added catalog debug logging')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
