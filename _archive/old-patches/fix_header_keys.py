with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# === Fix 1: Move Keys button to bottom of left panel ===
# Currently Keys is at L2239-L2244 (between DESIGN buttons and MEASURE)
# Move it after Ruler (L2256), before the closing </div> at L2257

# Remove L2239-L2244 (Keys button + separator before it)
# L2239: <div separator>
# L2240: <button Keys...
# L2241:   className=...
# L2242:   <span icon>
# L2243:   <span label>
# L2244: </button>

keys_block = lines[2238:2244]  # index 2238-2243 = L2239-L2244

# Remove these lines
del lines[2238:2244]

# Now Ruler ends at what was L2256 but shifted up by 6 lines -> now L2250
# The </div> closing left toolbar was at L2257 -> now L2251
# Insert Keys before </div> with a flex spacer to push it to bottom

# Find the closing </div> of left toolbar (should be around new L2251)
# Verify
toolbar_close_idx = None
for i in range(2245, min(2260, len(lines))):
    if lines[i].strip() == '</div>' and i > 2248:
        toolbar_close_idx = i
        break

if toolbar_close_idx:
    # Insert spacer + Keys before the closing </div>
    insert_block = [
        '          <div className="flex-1" />\n',  # spacer pushes Keys to bottom
    ] + keys_block
    
    for j, line in enumerate(insert_block):
        lines.insert(toolbar_close_idx + j, line)
    
    print(f"FIXED: Keys button moved to bottom (inserted at L{toolbar_close_idx+1})")
else:
    print("WARNING: Could not find toolbar closing div")

# === Fix 2: Redesign header ===
# Find TOP BAR section
topbar_start = None
topbar_end = None
for i, line in enumerate(lines):
    if '{/* TOP BAR */}' in line:
        topbar_start = i
    if topbar_start and i > topbar_start and line.strip() == '</div>' and 'h-12' not in line:
        # Check if this is the closing of the top bar div
        # The top bar starts at topbar_start+1 with <div className="h-12...
        # Count opening/closing divs
        depth = 0
        for j in range(topbar_start + 1, i + 1):
            depth += lines[j].count('<div') - lines[j].count('</div')
        if depth == 0:
            topbar_end = i
            break

print(f"Top bar: L{topbar_start+1} to L{topbar_end+1}")

# Replace L2041 (the <div className="h-12..."> line) with improved styling
# Find the h-12 line
h12_idx = topbar_start + 1
old_h12 = lines[h12_idx]
lines[h12_idx] = '      <div className="h-11 bg-white border-b border-gray-100 flex items-center px-3 gap-1.5 shrink-0 z-20 shadow-sm">\n'

# Replace Back button with cleaner icon-only style
for i in range(topbar_start, topbar_start + 10):
    if 'onBack' in lines[i] and 'Back' in lines[i]:
        lines[i] = '        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Back"><span className="text-lg">&#8592;</span></button>\n'
        print("FIXED: Back button -> icon only")
        break

# Replace boxType display with cleaner badge
for i in range(topbar_start, topbar_start + 10):
    if 'boxType' in lines[i] and 'font-semibold' in lines[i]:
        lines[i] = '        {boxType && <span className="text-[11px] font-semibold text-gray-700 bg-gray-50 px-2 py-0.5 rounded">{boxType}</span>}\n'
        print("FIXED: boxType badge style")
        break

# Clean up dieline filename badge
for i in range(topbar_start, topbar_start + 10):
    if 'dielineFileName' in lines[i] and 'bg-blue-50' in lines[i]:
        lines[i] = '        {dielineFileName && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded font-medium truncate max-w-[160px]" title={dielineFileName}>{dielineFileName}</span>}\n'
        print("FIXED: dieline filename badge")
        break

# Replace Save button style
for i in range(topbar_start, topbar_end + 1 if topbar_end else topbar_start + 200):
    if 'fileSave' in lines[i] and 'bg-gray-900' in lines[i]:
        lines[i] = '        <button onClick={fileSave} title="Save (Ctrl+S)" className="px-3 py-1 rounded-lg text-[11px] font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors shadow-sm">Save</button>\n'
        print("FIXED: Save button style")
        break

# Replace Export button style
for i in range(topbar_start, topbar_end + 1 if topbar_end else topbar_start + 200):
    if 'setShowExport' in lines[i] and 'bg-blue-600' in lines[i]:
        lines[i] = '        <button onClick={() => setShowExport(true)} className="px-4 py-1 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm">Export</button>\n'
        print("FIXED: Export button gradient style")
        break

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.writelines(lines)
print(f"Total lines: {len(lines)}")
