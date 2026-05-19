with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

anchor = 'const [showSymbolPanel, setShowSymbolPanel] = useState(false);'
if 'symbolSearch' not in src and anchor in src:
    src = src.replace(anchor, anchor + '\n  const [symbolSearch, setSymbolSearch] = useState("");\n  const [symbolCategory, setSymbolCategory] = useState("all");')
    print('Added symbolSearch and symbolCategory states')
else:
    if 'symbolSearch' in src:
        print('symbolSearch already exists')
    else:
        print('ERROR: anchor not found')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
