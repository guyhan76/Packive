with open('src/components/editor/unified-editor.tsx', 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8')
lines = text.split('\n')

fixes = 0

# Fix1: L2517 - check exact content
line2517 = lines[2516]
print(f"L2517 repr: {repr(line2517[:100])}")
# Replace any variant of title={...}
import re
old = re.search(r'title=\{[^}]*t\.name[^}]*\}', line2517)
if old:
    lines[2516] = line2517[:old.start()] + 'title={${t.name} - }' + line2517[old.end():]
    fixes += 1
    print(f"Fix1: {repr(lines[2516].rstrip()[:100])}")

# Fix2: L2524 - check exact content
line2524 = lines[2523]
print(f"L2524 repr: {repr(line2524[:120])}")
old2 = re.search(r'className=\{[^}]*rounded-full[^}]*\}', line2524)
if old2:
    lines[2523] = line2524[:old2.start()] + 'className={w-[4px] h-[4px] rounded-full }' + line2524[old2.end():]
    fixes += 1
    print(f"Fix2: {repr(lines[2523].rstrip()[:120])}")

# Fix3: L2535 - check exact content with possible \x0c
line2535 = lines[2534]
print(f"L2535 repr: {repr(line2535[:120])}")
old3 = re.search(r'className=\{[^}]*items-center justify-center w-full h-full[^}]*\}', line2535)
if old3:
    lines[2534] = line2535[:old3.start()] + 'className={lex items-center justify-center w-full h-full }' + line2535[old3.end():]
    fixes += 1
    print(f"Fix3: {repr(lines[2534].rstrip()[:120])}")

result = '\n'.join(lines)
with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(result)

print(f"\nTotal fixes: {fixes}")
print(f"Has \\x0c: {chr(12) in result}")
print(f"Has t.code in title: {'' in result}")

# Print fixed lines
for ln in [2517, 2524, 2535]:
    print(f"L{ln}: {lines[ln-1].rstrip()[:130]}")
