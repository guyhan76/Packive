with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
fixes = 0

for i in range(len(lines)):
    line = lines[i]
    
    # Fix1: title with  but missing backticks
    if 'title={' in line and '' not in line:
        print(f"Found title at L{i+1}: {repr(line.rstrip()[:100])}")
        # Replace entire line content
        leading = line[:len(line) - len(line.lstrip())]
        lines[i] = leading + 'title={${t.name} - }\n'
        fixes += 1
        print(f"  -> {repr(lines[i].rstrip()[:100])}")

    # Fix2: className={w-[4px] without backtick
    if 'className={w-[4px]' in line and '' not in line:
        print(f"Found dots at L{i+1}: {repr(line.rstrip()[:120])}")
        leading = line[:len(line) - len(line.lstrip())]
        lines[i] = leading + '<div key={i} className={w-[4px] h-[4px] rounded-full } />\n'
        fixes += 1
        print(f"  -> {repr(lines[i].rstrip()[:120])}")

    # Fix3: \x0c (form feed) in className
    if '\x0c' in line:
        print(f"Found \\x0c at L{i+1}: {repr(line.rstrip()[:120])}")
        leading = line[:len(line) - len(line.lstrip())]
        lines[i] = leading + '<div className={lex items-center justify-center w-full h-full } dangerouslySetInnerHTML={{ __html: t.iconSvg }} />\n'
        fixes += 1
        print(f"  -> {repr(lines[i].rstrip()[:120])}")

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

# Verify
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

print(f"\nTotal fixes: {fixes}")
print(f"Has \\x0c: {chr(12) in src}")
print(f"title ok: {'title={${t.name} - }' in src}")
print(f"dots ok: {'w-[4px] h-[4px] rounded-full' in src}")
print(f"icon ok: {'lex items-center justify-center w-full h-full' in src}")
