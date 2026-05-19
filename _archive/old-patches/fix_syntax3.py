with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

fixes = 0

# Fix1: title - find exact bytes
# The repr showed: title={\\n\\n}
# This means literal backslash-n, not newline. Let's find it precisely.
import re

# Search for title={ followed by  and ending with }
match = re.search(r'title=\{(\$\{t\.name\}[^}]*)\}', src)
if match:
    old_title = match.group(0)
    print(f"Found title: {repr(old_title)}")
    src = src.replace(old_title, 'title={${t.name} - }')
    fixes += 1
    print("Fix1: title attribute fixed")

# Fix2: Remove \x0c (form feed char) - replace with 'f'
# The line has \x0clex instead of flex
if '\x0c' in src:
    count = src.count('\x0c')
    src = src.replace('\x0clex', 'flex')
    # if any remaining \x0c
    src = src.replace('\x0c', '')
    fixes += 1
    print(f"Fix2: removed {count} form-feed char(s)")

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)

print(f"\nTotal fixes: {fixes}")

# Final verification
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()
print(f"Has \\x0c: {chr(12) in src}")
print(f"title ok: {'title={' in src}")

# Check build-critical lines
for i, line in enumerate(src.split('\n')):
    if i+1 >= 2515 and i+1 <= 2540:
        print(f"L{i+1}: {line.rstrip()[:130]}")
