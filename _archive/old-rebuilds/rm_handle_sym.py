with open("src/lib/packaging-symbols.ts", "r", encoding="utf-8") as f:
    src = f.read()

# Remove handle entries from PACKAGING_SYMBOLS
lines = src.split('\n')
new_lines = []
removed = 0
for line in lines:
    if '"handle"' in line and ('handle-full-cut' in line or 'handle-half-cut' in line or 'finger-hole' in line):
        removed += 1
        continue
    new_lines.append(line)

# Remove handle category
new_lines = [l for l in new_lines if '"handle", name: "Handle"' not in l]

src = '\n'.join(new_lines)

with open("src/lib/packaging-symbols.ts", "w", encoding="utf-8") as f:
    f.write(src)
print(f"Removed {removed} handle entries from symbols")
print(f"Total lines: {len(new_lines)}")
