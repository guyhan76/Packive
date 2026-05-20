with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find the symbol panel block
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if '{/* Symbols Popup */}' in line:
        start_idx = i
        break

if start_idx is None:
    print('ERROR: Symbols Popup comment not found')
else:
    # Find end of symbol panel block
    brace = 0
    for i in range(start_idx + 1, len(lines)):
        if 'showSymbolPanel && (' in lines[i]:
            brace = 1
        brace += lines[i].count('(') - lines[i].count(')')
        brace += lines[i].count('{') - lines[i].count('}')
        if brace <= 0 and i > start_idx + 1:
            end_idx = i
            break
    
    print(f'Symbol panel: L{start_idx+1} to L{end_idx+1}')
    
    # Extract panel lines
    panel_block = lines[start_idx:end_idx+1]
    
    # Remove from current position
    del lines[start_idx:end_idx+1]
    
    # Now find the )} that closes the parent block (was L2379, now shifted)
    # Look for the line with just "          )}" before where symbol panel was
    # Insert BEFORE that closing line
    # Find the Barcode panel to understand the parent
    barcode_line = None
    for i, line in enumerate(lines):
        if '{/* Barcode Popup */}' in line:
            barcode_line = i
            break
    
    if barcode_line:
        print(f'Barcode panel at L{barcode_line+1}')
        # Insert symbol panel right after barcode comment line (before it actually)
        # Better: find the closing )} of the shapes panel parent
        # Look for "          )}" after L2370 area
        insert_before = None
        for i in range(barcode_line - 1, barcode_line - 20, -1):
            stripped = lines[i].strip()
            if stripped == ')}':
                insert_before = i
                print(f'Found parent close at L{i+1}: {lines[i].rstrip()}')
                break
        
        if insert_before:
            # Insert symbol panel BEFORE the closing )}
            for j, pl in enumerate(panel_block):
                lines.insert(insert_before + j, pl)
            print(f'Inserted at L{insert_before+1}')
    
    with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
        f.write('\n'.join([l.rstrip('\n') for l in lines]))
    print(f'Total lines: {len(lines)}')
