with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Step 1: Check if symbolCategory state already exists (added earlier)
if 'symbolCategory' in src:
    print('symbolCategory state found')
else:
    print('symbolCategory state NOT found')

# Step 2: Check if showSymbolPanel state exists
if 'showSymbolPanel' in src:
    print('showSymbolPanel state found')
else:
    # Add showSymbolPanel state near other panel states
    anchor = 'const [showTablePanel, setShowTablePanel] = useState(false);'
    if anchor in src:
        src = src.replace(anchor, anchor + '\n  const [showSymbolPanel, setShowSymbolPanel] = useState(false);')
        print('Added showSymbolPanel state')
    else:
        print('ERROR: cannot find anchor for state')

# Step 3: Fix the broken Symbols button at L2198 - replace leftTab with showSymbolPanel
old_btn = 'setLeftTab(leftTab === "symbols" ? null : "symbols")'
new_btn = 'setShowSymbolPanel(p => !p)'
if old_btn in src:
    src = src.replace(old_btn, new_btn)
    print('Fix1: replaced setLeftTab with setShowSymbolPanel')

# Also fix the className condition
old_cls = 'leftTab === "symbols" ? "bg-blue-50 text-blue-600"'
new_cls = 'showSymbolPanel ? "bg-blue-50 text-blue-600"'
if old_cls in src:
    src = src.replace(old_cls, new_cls)
    print('Fix2: replaced leftTab className condition')

# Step 4: Find and fix the symbols panel content (leftTab === "symbols" && ...)
old_panel = 'leftTab === "symbols"'
count = src.count(old_panel)
if count > 0:
    src = src.replace(old_panel, 'showSymbolPanel')
    print(f'Fix3: replaced {count} remaining leftTab === "symbols" references')
else:
    print('No remaining leftTab === "symbols" references')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
