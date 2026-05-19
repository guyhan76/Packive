with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Find showSymbolPanel line and add after it
old = 'const [showSymbolPanel, setShowSymbolPanel] = useState(false);'
new = old + '\n  const [symbolSearch, setSymbolSearch] = useState("");\n  const [symbolCategory, setSymbolCategory] = useState<string>("all");'

if 'setSymbolSearch] = useState' not in src:
    src = src.replace(old, new)
    print('Added symbolSearch + symbolCategory')
else:
    print('Already declared')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
