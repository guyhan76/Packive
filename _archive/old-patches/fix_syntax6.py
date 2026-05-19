with open('src/components/editor/unified-editor.tsx', 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8')
lines = text.split('\n')

# L2517 (index 2516) - replace entire line
old_2517 = lines[2516]
indent = '                        '
lines[2516] = indent + 'title={${t.name} - }\r'
print(f"Fix1 L2517: {repr(lines[2516][:80])}")

# L2524 (index 2523) - replace entire line
old_2524 = lines[2523]
indent2 = '                              '
lines[2523] = indent2 + '<div key={i} className={w-[4px] h-[4px] rounded-full } />\r'
print(f"Fix2 L2524: {repr(lines[2523][:120])}")

# L2535 (index 2534) - replace entire line
old_2535 = lines[2534]
indent3 = '                            '
lines[2534] = indent3 + '<div className={lex items-center justify-center w-full h-full } dangerouslySetInnerHTML={{ __html: t.iconSvg }} />\r'
print(f"Fix3 L2535: {repr(lines[2534][:120])}")

result = '\n'.join(lines)
with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(result)

# Verify
print(f"\nHas \\x0c: {chr(12) in result}")
has_backtick_title = '${t.name} - ' in result
has_backtick_dots = 'w-[4px] h-[4px] rounded-full' in result
has_backtick_icon = 'lex items-center justify-center w-full h-full' in result
print(f"title backtick: {has_backtick_title}")
print(f"dots backtick: {has_backtick_dots}")
print(f"icon backtick: {has_backtick_icon}")
