with open('src/components/editor/unified-editor.tsx', 'rb') as f:
    raw = f.read()

# Count actual 0x0c byte
actual_ff = raw.count(bytes([0x0c]))
print(f"Actual 0x0c bytes remaining: {actual_ff}")

# Find positions
pos = 0
while True:
    idx = raw.find(bytes([0x0c]), pos)
    if idx == -1:
        break
    context = raw[max(0,idx-20):idx+20]
    print(f"  pos {idx}: {context}")
    pos = idx + 1

# Remove ALL 0x0c bytes
raw = raw.replace(bytes([0x0c]), b'')

with open('src/components/editor/unified-editor.tsx', 'wb') as f:
    f.write(raw)

# Verify
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

remaining = src.count(chr(12))
print(f"\nAfter cleanup - 0x0c remaining: {remaining}")

# Check the lines
for i, line in enumerate(src.split('\n')):
    if 'lex items-center justify-center w-full h-full' in line and 'dangerouslySetInnerHTML' in line:
        print(f"L{i+1}: {line.rstrip()[:140]}")
