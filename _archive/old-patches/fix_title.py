with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Fix title={ - } -> title={${t.name} - }
old = 'title={ - }'
new = 'title={${t.name} - }'

count = src.count(old)
print(f"Found title pattern: {count} times")

src = src.replace(old, new)

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)

# Verify
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

print(f"Remaining broken title: {src.count(old)}")
print(f"Fixed title count: {src.count(new)}")

for i, line in enumerate(src.split('\n')):
    if 'title={' in line and 't.name' in line:
        print(f"L{i+1}: {repr(line.rstrip()[:120])}")
