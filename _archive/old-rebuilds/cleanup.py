with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Remove the debug catalog logging
src = src.replace('''  console.log("[PDF] Catalog search:", catIdx >= 0 ? "found at " + catIdx : "NOT FOUND");
  if (catIdx >= 0) {
    console.log("[PDF] Catalog context:", rawPdf.substring(catIdx, catIdx + 200));
  }
''', '')

print('Removed debug logging')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
