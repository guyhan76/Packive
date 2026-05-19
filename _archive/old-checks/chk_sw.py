with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Find the Half Cut canvas SVG (the one with stroke-width, not strokeWidth)
import re
# Find all stroke-width patterns near "Half Cut" or "00AA00"
for m in re.finditer(r'stroke-width="(\d+)"', src):
    start = max(0, m.start()-100)
    context = src[start:m.end()+10]
    if '00AA00' in context or 'half' in context.lower():
        line_num = src[:m.start()].count('\n') + 1
        print(f"L{line_num}: stroke-width=\"{m.group(1)}\" context: ...{context[-80:]}...")
