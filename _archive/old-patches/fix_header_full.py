with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# === Step 1: Remove Select button from left panel ===
select_removed = False
for i in range(2215, 2240):
    if 'label: "Select"' in lines[i]:
        lines[i] = ''  # Remove Select button line
        select_removed = True
        print(f"REMOVED: Select button at L{i+1}")
        break

# === Step 2: Redesign header (L2040-L2211) ===
# Find exact line indices
header_start = None  # {/* TOP BAR */}
header_div = None    # <div className="h-11...
header_close = None  # </div> closing the header

for i, line in enumerate(lines):
    if '{/* TOP BAR */}' in line:
        header_start = i
        header_div = i + 1
    if header_start and i > header_start and line.strip() == '</div>':
        # Check if this is the right closing div by looking at next line
        if i + 1 < len(lines) and ('flex flex-1' in lines[i+1] or 'flex-1 overflow' in lines[i+1] or lines[i+1].strip() == ''):
            header_close = i
            break

if not header_close:
    # Fallback: find by known pattern
    for i, line in enumerate(lines):
        if '</div>' in line and i > 2200 and i < 2220:
            if i+1 < len(lines) and 'flex flex-1' in lines[i+1]:
                header_close = i
                break

print(f"Header: L{header_start+1} to L{header_close+1}")

# Extract the dieline file input handler (L2048-L2165) - must preserve this
dieline_input_lines = []
input_start = None
input_end = None
for i in range(header_div, header_close):
    if '<input ref={dielineFileRef}' in lines[i]:
        input_start = i
    if input_start and '/>' in lines[i] and '}} />' in lines[i]:
        input_end = i
        break
    if input_start and i > input_start + 200:
        input_end = i
        break

if input_start and input_end:
    dieline_input_lines = lines[input_start:input_end+1]
    print(f"Preserved dieline input handler: L{input_start+1}-L{input_end+1} ({len(dieline_input_lines)} lines)")

# Extract file load input
fileload_lines = []
for i in range(header_div, header_close):
    if '<input ref={fileLoadRef}' in lines[i]:
        fileload_lines = [lines[i]]
        print(f"Preserved file load input: L{i+1}")
        break

# Build new header
new_header = []
new_header.append('      {/* TOP BAR */}\n')
new_header.append('      <div className="h-11 bg-white border-b border-gray-100/80 flex items-center shrink-0 z-20">\n')
new_header.append('        {/* LEFT: Logo + File info */}\n')
new_header.append('        <div className="flex items-center gap-2 px-3 min-w-[220px]">\n')
new_header.append('          <button onClick={onBack} className="flex items-center gap-1.5 group" title="Back to home">\n')
new_header.append('            <span className="text-[13px] font-black tracking-tight text-gray-800 group-hover:text-blue-600 transition-colors">Packive</span>\n')
new_header.append('          </button>\n')
new_header.append('          <div className="w-px h-5 bg-gray-200" />\n')
new_header.append('          {boxType && <span className="text-[10px] font-semibold text-gray-500">{boxType}</span>}\n')
new_header.append('          {dielineFileName && <span className="text-[10px] text-gray-400 truncate max-w-[120px]" title={dielineFileName}>{dielineFileName}</span>}\n')
new_header.append('          {!dielineFileName && boxType && <span className="text-[10px] text-gray-400">{L}x{W}x{D}</span>}\n')
new_header.append('        </div>\n')
new_header.append('\n')
new_header.append('        {/* CENTER: Dieline tools + Undo/Redo + Zoom */}\n')
new_header.append('        <div className="flex-1 flex items-center justify-center gap-1">\n')
new_header.append('          {/* Dieline controls - compact */}\n')
new_header.append('          <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg px-1 py-0.5">\n')
new_header.append('            <button onClick={() => dielineFileRef.current?.click()} className="px-2 py-1 rounded-md text-[10px] font-medium text-gray-500 hover:text-gray-800 hover:bg-white transition-all" title="Upload Dieline">Upload</button>\n')
new_header.append('            <button onClick={() => { if (!window.confirm("Start a completely new blank canvas?\\nAll current work will be removed.")) return; const c = fcRef.current; if(!c) return; c.getObjects().slice().forEach((o:any) => c.remove(o)); c.requestRenderAll(); setDielineFileName(""); setDielineUngrouped(false); pushHistory(); refreshLayers(); }} className="px-2 py-1 rounded-md text-[10px] font-medium text-gray-500 hover:text-gray-800 hover:bg-white transition-all" title="New Canvas">New</button>\n')
new_header.append('            <div className="w-px h-4 bg-gray-200" />\n')
new_header.append('            <button onClick={() => { const c = fcRef.current; if (!c) return; const nv = !dielineVisible; setDielineVisible(nv); c.getObjects().forEach((o: any) => { if (o._isGuideLayer || o._isDieLine || o._isFoldLine) { o.visible = nv; } }); c.requestRenderAll(); }} className={`px-1.5 py-1 rounded-md text-[10px] transition-all ${dielineVisible ? "text-gray-700 bg-white shadow-sm" : "text-gray-400"}`} title="Toggle Dieline">Die</button>\n')
new_header.append('            <button onClick={() => { const c = fcRef.current; if (!c) return; const nv = !dielineInfoVisible; setDielineInfoVisible(nv); let count = 0; c.getObjects().forEach((o: any) => { if (o._isDielineInfo) { o.visible = nv; count++; } if (o._objects) o._objects.forEach((ch: any) => { if (ch._isDielineInfo) { ch.visible = nv; count++; } }); }); c.requestRenderAll(); }} className={`px-1.5 py-1 rounded-md text-[10px] transition-all ${dielineInfoVisible ? "text-gray-700 bg-white shadow-sm" : "text-gray-400"}`} title="Toggle Info">Info</button>\n')
new_header.append('            <button onClick={() => { const c = fcRef.current; if (!c) return; const nl = !dielineLocked; setDielineLocked(nl); c.getObjects().forEach((o: any) => { if (o._isGuideLayer || o._isDieLine || o._isFoldLine) { o.selectable = !nl; o.evented = !nl; } }); c.requestRenderAll(); }} className={`px-1.5 py-1 rounded-md text-[10px] transition-all ${dielineLocked ? "text-amber-600 bg-amber-50" : "text-gray-400"}`} title="Lock/Unlock Dieline">{dielineLocked ? "Locked" : "Lock"}</button>\n')
new_header.append('          </div>\n')
new_header.append('\n')
new_header.append('          <div className="w-px h-5 bg-gray-200 mx-1" />\n')
new_header.append('\n')
new_header.append('          {/* Undo/Redo */}\n')
new_header.append('          <div className="flex items-center gap-0.5">\n')
new_header.append('            <button onClick={undo} title="Undo (Ctrl+Z)" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-sm">&#8630;</button>\n')
new_header.append('            <button onClick={redo} title="Redo (Ctrl+Y)" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-sm">&#8631;</button>\n')
new_header.append('          </div>\n')
new_header.append('\n')
new_header.append('          <div className="w-px h-5 bg-gray-200 mx-1" />\n')
new_header.append('\n')
new_header.append('          {/* Zoom */}\n')
new_header.append('          <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg px-1 py-0.5">\n')
new_header.append('            <button onClick={() => applyZoom(zoom - 25)} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-white text-xs transition-all">-</button>\n')
new_header.append('            <span className="text-[10px] text-gray-500 w-9 text-center font-medium">{zoom}%</span>\n')
new_header.append('            <button onClick={() => applyZoom(zoom + 25)} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-white text-xs transition-all">+</button>\n')
new_header.append('            <button onClick={() => { const c = fcRef.current; if (!c) return; const objs = c.getObjects(); if (objs.length === 0) { applyZoom(100); return; } let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity; objs.forEach((o:any) => { const b = o.getBoundingRect(); if(b.left<minX) minX=b.left; if(b.top<minY) minY=b.top; if(b.left+b.width>maxX) maxX=b.left+b.width; if(b.top+b.height>maxY) maxY=b.top+b.height; }); const cw=c.getWidth(),ch=c.getHeight(); const fitZ = Math.min(cw/(maxX-minX+40), ch/(maxY-minY+40)) * 100; applyZoom(Math.round(Math.min(fitZ,200))); }} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-white text-[10px] transition-all" title="Fit to view">Fit</button>\n')
new_header.append('          </div>\n')
new_header.append('        </div>\n')
new_header.append('\n')
new_header.append('        {/* RIGHT: Save + Export */}\n')
new_header.append('        <div className="flex items-center gap-1.5 px-3 min-w-[220px] justify-end">\n')
new_header.append('          <button onClick={() => fileLoadRef.current?.click()} title="Load" className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">Load</button>\n')
new_header.append('          <button onClick={fileSave} title="Save (Ctrl+S)" className="px-3 py-1 rounded-lg text-[10px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Save</button>\n')
new_header.append('          <button onClick={() => setShowExport(true)} className="px-4 py-1.5 rounded-lg text-[10px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">Export</button>\n')
new_header.append('        </div>\n')
new_header.append('\n')
new_header.append('        {/* Hidden file inputs */}\n')
for line in dieline_input_lines:
    new_header.append(line)
for line in fileload_lines:
    new_header.append(line)
new_header.append('      </div>\n')

# Replace header section
result = lines[:header_start] + new_header + lines[header_close+1:]

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.writelines(result)

print(f"\nTotal lines: {len(result)}")
print("Header redesigned:")
print("  LEFT: Packive logo + boxType + filename")
print("  CENTER: Dieline tools (compact) + Undo/Redo + Zoom")
print("  RIGHT: Load + Save + Export")
if select_removed:
    print("  Select button removed from left panel")
