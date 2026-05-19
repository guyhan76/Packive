with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

changes = 0

# Fix 1: Add showSymbolPanel state
anchor = 'const [showTablePanel, setShowTablePanel] = useState(false);'
if 'showSymbolPanel' not in src and anchor in src:
    src = src.replace(anchor, anchor + '\n  const [showSymbolPanel, setShowSymbolPanel] = useState(false);')
    changes += 1
    print('Added showSymbolPanel state')

# Fix 2: Fix leftTab references to showSymbolPanel
if 'setLeftTab(leftTab === "symbols"' in src:
    src = src.replace('setLeftTab(leftTab === "symbols" ? null : "symbols")', 'setShowSymbolPanel(p => !p)')
    changes += 1
    print('Fixed button onClick')

if 'leftTab === "symbols" ? "bg-blue-50 text-blue-600"' in src:
    src = src.replace('leftTab === "symbols" ? "bg-blue-50 text-blue-600"', 'showSymbolPanel ? "bg-blue-50 text-blue-600"')
    changes += 1
    print('Fixed button className')

if 'leftTab === "symbols"' in src:
    src = src.replace('leftTab === "symbols"', 'showSymbolPanel')
    changes += 1
    print('Fixed panel condition')

# Fix 3: cat.label -> cat.nameKo
if '{cat.label}' in src:
    src = src.replace('{cat.label}', '{cat.nameKo}')
    changes += 1
    print('Fixed cat.label -> cat.nameKo')

# Fix 4: Move symbol panel inside parent div
# Find the symbol panel and the closing )} before it
lines = src.split('\n')
sym_start = None
sym_end = None
for i, line in enumerate(lines):
    if 'showSymbolPanel && (' in line:
        sym_start = i
        depth = 0
        started = False
        for j in range(i, len(lines)):
            for ch in lines[j]:
                if ch == '(' or ch == '{':
                    depth += 1
                    started = True
                elif ch == ')' or ch == '}':
                    depth -= 1
            if started and depth <= 0:
                sym_end = j
                break
        break

if sym_start is not None:
    print(f'Symbol panel found: L{sym_start+1} to L{sym_end+1}')
    
    # Find the )} closing line right before symbol panel
    close_line = None
    for i in range(sym_start - 1, max(0, sym_start - 10), -1):
        if lines[i].strip() == ')}':
            close_line = i
            break
    
    if close_line is not None:
        print(f'Parent close at L{close_line+1}')
        
        # Extract symbol panel
        panel = lines[sym_start:sym_end+1]
        
        # Remove from current position
        del lines[sym_start:sym_end+1]
        
        # Insert before the closing )}
        for j, pl in enumerate(panel):
            lines.insert(close_line + j, pl)
        
        print(f'Moved panel to L{close_line+1}')
        changes += 1

src = '\n'.join(lines)
with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total changes: {changes}, Total lines: {len(lines)}')
