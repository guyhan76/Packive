with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Check how Fabric is loaded elsewhere (e.g., image upload, barcode)
import re
# Find all fromURL calls
for m in re.finditer(r'\.fromURL\(', src):
    start = max(0, m.start()-80)
    end = min(len(src), m.end()+120)
    line_num = src[:m.start()].count('\n') + 1
    snippet = src[start:end].replace('\n',' ')
    print(f"L{line_num}: ...{snippet}...")
    print()
