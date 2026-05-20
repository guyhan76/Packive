with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Check if import exists
if 'PACKAGING_SYMBOLS' in src and 'import' in src.split('PACKAGING_SYMBOLS')[0].split('\n')[-1]:
    print('Import already exists')
else:
    # Find first import line to add after
    lines = src.split('\n')
    for i, line in enumerate(lines):
        if line.startswith('import') and 'from' in line:
            last_import = i
    
    import_line = 'import { PACKAGING_SYMBOLS, SYMBOL_CATEGORIES } from "@/lib/packaging-symbols";'
    lines.insert(last_import + 1, import_line)
    src = '\n'.join(lines)
    print(f'Added import at L{last_import + 2}')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
