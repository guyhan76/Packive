# Step 1: Read current file
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
print(f"L2517 BEFORE: {repr(lines[2516][:80])}")
print(f"L2524 BEFORE: {repr(lines[2523][:80])}")
print(f"L2535 BEFORE: {repr(lines[2534][:80])}")

# Step 2: Modify in memory
lines[2516] = '                        title={${t.name} - }\n'
lines[2523] = '                              <div key={i} className={w-[4px] h-[4px] rounded-full } />\n'
lines[2534] = '                            <div className={lex items-center justify-center w-full h-full } dangerouslySetInnerHTML={{ __html: t.iconSvg }} />\n'

# Step 3: Write
with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

# Step 4: Re-read and verify
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    verify = f.readlines()

print(f"\nL2517 AFTER: {repr(verify[2516][:80])}")
print(f"L2524 AFTER: {repr(verify[2523][:80])}")
print(f"L2535 AFTER: {repr(verify[2534][:80])}")

match1 = verify[2516] == lines[2516]
match2 = verify[2523] == lines[2523]
match3 = verify[2534] == lines[2534]
print(f"\nL2517 match: {match1}")
print(f"L2524 match: {match2}")
print(f"L2535 match: {match3}")
