with open('src/components/editor/unified-editor.tsx','rb') as f:
    raw = f.read()

# Find the fileLoadRef input
idx = raw.find(b'fileLoadRef')
positions = []
start = 0
while True:
    pos = raw.find(b'fileLoadRef', start)
    if pos == -1: break
    positions.append(pos)
    start = pos + 1

print(f"fileLoadRef occurrences at byte positions: {positions}")

# Check bytes around the last occurrence (the input tag)
for p in positions:
    context = raw[p-50:p+200]
    print(f"\n--- Around byte {p} ---")
    print(repr(context))
