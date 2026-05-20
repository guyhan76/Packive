with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find symbol panel start and end
sym_start = None
sym_end = None
for i, line in enumerate(lines):
    if '{/* Packaging Symbols Popup */}' in line:
        sym_start = i
        break

# Find end: count from showSymbolPanel && (
depth = 0
started = False
for i in range(sym_start + 1, len(lines)):
    for ch in lines[i]:
        if ch in '({':
            depth += 1
            started = True
        elif ch in ')}':
            depth -= 1
    if started and depth <= 0:
        sym_end = i
        break

print(f'Symbol panel: L{sym_start+1} to L{sym_end+1}')

# Extract
panel_block = lines[sym_start:sym_end+1]

# Remove from current position
del lines[sym_start:sym_end+1]

# Now find Barcode panel closing )} after removal
# Find {/* Table Popup */} and insert before it
for i, line in enumerate(lines):
    if '{/* Table Popup */}' in line:
        insert_at = i
        print(f'Inserting before Table Popup at L{i+1}')
        break

# Insert
for j, pl in enumerate(panel_block):
    lines.insert(insert_at + j, pl)

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(''.join(lines))
print(f'Total lines: {len(lines)}')
