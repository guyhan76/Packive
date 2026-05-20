with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print raw bytes of L2202
line = lines[2201]
print(f"L2202 length: {len(line)}")
print(f"Raw bytes: {line.encode('utf-8')[:300]}")

# Check for any non-ASCII or special chars
for i, ch in enumerate(line):
    if ord(ch) > 127 or ord(ch) < 32:
        if ch not in '\r\n\t':
            print(f"  Special char at pos {i}: {repr(ch)} (ord={ord(ch)})")
