with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Step 1: Extract Keys button block (L2239-L2244, index 2238-2243)
keys_block = lines[2238:2244]
print("Keys block to move:")
for l in keys_block:
    print(f"  {l.rstrip()[:120]}")

# Step 2: Remove Keys from current position
del lines[2238:2244]
# After deletion, Ruler ends at L2250 (was L2256), </div> at L2251 (was L2257)

# Step 3: Insert Keys before </div> closing left toolbar
# Find </div> that closes left toolbar (should be around index 2251)
insert_idx = None
for i in range(2245, 2255):
    if lines[i].strip() == '</div>':
        insert_idx = i
        break

if insert_idx:
    # Insert: flex spacer + separator + Keys button
    spacer = ['          <div className="flex-1" />\n']
    for j, line in enumerate(spacer + keys_block):
        lines.insert(insert_idx + j, line)
    print(f"\nInserted Keys at bottom (before L{insert_idx+1})")
else:
    print("ERROR: closing </div> not found")

# Step 4: Improve header styling
for i, line in enumerate(lines):
    # Header container
    if 'h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-2' in line:
        lines[i] = line.replace(
            'h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-2 shrink-0 z-20',
            'h-11 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center px-3 gap-1.5 shrink-0 z-20'
        )
        print("FIXED: header container style")
    
    # Back button - icon only
    if 'onBack' in line and '&#8592;' in line and 'Back</button>' in line:
        lines[i] = '        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Back to home"><span className="text-base">&#8592;</span></button>\n'
        print("FIXED: Back button icon-only")
    
    # boxType badge
    if 'boxType' in line and 'font-semibold text-gray-800' in line and '<span' in line:
        lines[i] = '        {boxType && <span className="text-[11px] font-semibold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md">{boxType}</span>}\n'
        print("FIXED: boxType badge")
    
    # Save button
    if 'fileSave' in line and 'bg-gray-900' in line:
        lines[i] = '        <button onClick={fileSave} title="Save (Ctrl+S)" className="px-3 py-1 rounded-lg text-[11px] font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors">Save</button>\n'
        print("FIXED: Save button")
    
    # Export button
    if 'setShowExport(true)' in line and 'bg-blue-600' in line:
        lines[i] = '        <button onClick={() => setShowExport(true)} className="px-4 py-1 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm">Export</button>\n'
        print("FIXED: Export button gradient")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.writelines(lines)
print(f"Total lines: {len(lines)}")
