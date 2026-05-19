import re

with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

fixes = 0

# Fix 1: L2517 - title attribute missing backticks
old1 = 'title={\\n\\n}'
new1 = 'title={${t.name}\\n\\n}'
if old1 in src:
    src = src.replace(old1, new1)
    fixes += 1
    print(f'Fix1: title attribute')

# Fix 2: L2524 - className missing backticks on popularity dots
old2 = 'className={w-[4px] h-[4px] rounded-full }'
new2 = 'className={w-[4px] h-[4px] rounded-full }'
if old2 in src:
    src = src.replace(old2, new2)
    fixes += 1
    print(f'Fix2: popularity dots className')

# Fix 3: L2535 - className missing 'f' and backticks
old3 = 'className={\\nlex items-center justify-center w-full h-full }'
new3 = 'className={lex items-center justify-center w-full h-full }'
if old3 in src:
    src = src.replace(old3, new3)
    fixes += 1
    print(f'Fix3: iconSvg div className')
else:
    # try alternate pattern
    old3b = 'className={\\n' + 'lex items-center justify-center w-full h-full }'
    if old3b in src:
        src = src.replace(old3b, new3)
        fixes += 1
        print(f'Fix3b: iconSvg div className (alt)')
    else:
        # brute force line-based fix
        lines = src.split('\\n')
        for i, line in enumerate(lines):
            if 'lex items-center justify-center w-full h-full' in line and 'dangerouslySetInnerHTML' in line:
                lines[i] = line.replace(
                    'className={\\nlex items-center justify-center w-full h-full }',
                    'className={lex items-center justify-center w-full h-full }'
                )
                # also try without newline
                if 'lex items-center' in lines[i]:
                    lines[i] = re.sub(
                        r'className=\{[^}]*lex items-center justify-center w-full h-full[^}]*\}',
                        'className={lex items-center justify-center w-full h-full }',
                        lines[i]
                    )
                fixes += 1
                print(f'Fix3c: iconSvg div className (line-based)')
                break
        src = '\\n'.join(lines)

# Fix 4: L2550, L2553 - gradient dividers with #FF0000 placeholder
old4a = 'from-transparent via-#FF0000-200 to-transparent'
old4b = 'ext-[10px] font-bold text-#FF0000-500 uppercase tracking-wider'
if old4a in src:
    src = src.replace('via-#FF0000-200', 'via-#FF0000-200')
    # need backticks on the whole className
    src = src.replace('className={h-px flex-1 bg-gradient-to-r from-transparent via-#FF0000-200 to-transparent}',
                      'className={h-px flex-1 bg-gradient-to-r from-transparent via-#FF0000-200 to-transparent}')
    fixes += 1
    print(f'Fix4a: gradient divider')
if old4b in src:
    src = src.replace('className={  ext-[10px] font-bold text-#FF0000-500 uppercase tracking-wider}',
                      'className={	ext-[10px] font-bold text-#FF0000-500 uppercase tracking-wider}')
    fixes += 1
    print(f'Fix4b: series label color')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)

print(f'\\nTotal fixes: {fixes}')
