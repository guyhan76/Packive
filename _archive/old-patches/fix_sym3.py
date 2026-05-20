with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

lines = src.split('\n')

# Step 1: Find and extract the symbol panel block (L2931 area)
start_idx = None
end_idx = None
brace_count = 0
for i, line in enumerate(lines):
    if 'showSymbolPanel && (' in line:
        start_idx = i
        brace_count = 0
        for j in range(i, len(lines)):
            brace_count += lines[j].count('{') - lines[j].count('}')
            brace_count += lines[j].count('(') - lines[j].count(')')
            if j > i and brace_count <= 0:
                end_idx = j
                break
        break

if start_idx is None:
    print('ERROR: Symbol panel not found')
else:
    print(f'Symbol panel: L{start_idx+1} to L{end_idx+1}')
    
    # Extract the panel lines
    panel_lines = lines[start_idx:end_idx+1]
    
    # Remove from original position
    del lines[start_idx:end_idx+1]
    
    # Find the Barcode panel position to insert after it
    # Insert right before {/* Barcode Popup */}
    insert_idx = None
    for i, line in enumerate(lines):
        if 'Barcode Popup' in line:
            insert_idx = i
            break
    
    if insert_idx is None:
        print('ERROR: Barcode Popup comment not found')
    else:
        # Fix indentation to match barcode panel (10 spaces)
        # Also fix positioning: use same style as barcode panel
        fixed_panel = []
        fixed_panel.append('')
        fixed_panel.append('          {/* Symbols Popup */}')
        for pl in panel_lines:
            fixed_panel.append(pl)
        fixed_panel.append('')
        
        for fp in reversed(fixed_panel):
            lines.insert(insert_idx, fp)
        
        print(f'Inserted symbol panel at L{insert_idx+1}')

src = '\n'.join(lines)
with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(lines)}')
