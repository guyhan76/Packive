with open('src/components/editor/unified-editor.tsx', 'rb') as f:
    raw = f.read()

# Direct byte replacement for \x0c issue
# \x0clex -> flex (form feed + 'lex' should be 'flex')
old_bytes = b'\x0clex items-center justify-center w-full h-full }'
new_bytes = b'lex items-center justify-center w-full h-full }'

count = raw.count(old_bytes)
print(f"Found \\x0c pattern: {count} times")

raw = raw.replace(old_bytes, new_bytes)

# Also fix className={ before it - remove the orphan {
# The line currently has: className={\x0clex...  -> after fix: className={lex...
# But we replaced \x0clex...} with lex...} so now it's className={lex...} which is correct

# Verify
print(f"Remaining \\x0c: {raw.count(b'\\x0c')}")

with open('src/components/editor/unified-editor.tsx', 'wb') as f:
    f.write(raw)

# Read back and verify
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

print(f"Has \\x0c: {chr(12) in src}")
print(f"icon className ok: {'className={' + chr(96) + 'flex items-center' in src}")

# Show the fixed lines
for i, line in enumerate(src.split('\\n')):
    if 'flex items-center justify-center w-full h-full' in line and 'dangerouslySetInnerHTML' in line:
        print(f"L{i+1}: {line.rstrip()[:140]}")
