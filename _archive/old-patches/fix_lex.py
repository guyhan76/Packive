with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Fix: className={lex items-center... -> className={lex items-center...}
old = 'className={lex items-center justify-center w-full h-full }'
new = 'className={lex items-center justify-center w-full h-full }'

count = src.count(old)
print(f"Found pattern: {count} times")

src = src.replace(old, new)

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)

# Verify
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

print(f"Remaining broken: {src.count('className={lex')}")
print(f"Fixed pattern count: {src.count(new)}")

for i, line in enumerate(src.split('\n')):
    if 'flex items-center justify-center w-full h-full' in line and 'dangerouslySetInnerHTML' in line:
        print(f"L{i+1}: {line.rstrip()[:150]}")
