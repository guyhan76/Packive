with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

idx = src.find('00AA00')
while idx >= 0:
    start = max(0, idx - 150)
    end = min(len(src), idx + 150)
    line_num = src[:idx].count('\n') + 1
    snippet = src[start:end].replace('\n', ' ')
    print(f"L{line_num}: ...{snippet}...")
    print()
    idx = src.find('00AA00', idx + 1)
