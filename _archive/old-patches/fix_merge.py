with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Remove PACKAGE separator (L2235-L2236) and merge into DESIGN
# L2235: <div className="w-8 h-px bg-gray-200 my-1" />
# L2236: <span ... >PACKAGE</span>
# L2237: {[

# Also need to close the DESIGN array before it and reopen
# Current structure:
# L2228: ].map(btn => (  <- DESIGN array ends
# ...
# L2234: ))}             <- DESIGN render ends
# L2235: <div .../>      <- separator (REMOVE)
# L2236: <span>PACKAGE   <- label (REMOVE)
# L2237: {[              <- new array starts (REMOVE)
# L2238-L2241: buttons
# L2242: ].map(btn => (  <- PACKAGE array ends

# Strategy: merge by removing L2234-L2237 and L2242-L2248,
# and inserting the PACKAGE buttons into the DESIGN array

# Verify markers
assert '))}' in lines[2233], f"L2234: {lines[2233].strip()}"
assert 'PACKAGE' in lines[2235], f"L2236: {lines[2235].strip()}"
assert 'Symbols' in lines[2237], f"L2238: {lines[2237].strip()}"
assert 'Barcode' in lines[2240], f"L2241: {lines[2240].strip()}"

# New merged DESIGN section: replace L2228-L2248
# Keep L2227 (Shapes) and add Symbols, Handle, Table, Barcode to same array
new_block = [
    '            { icon: "⚠", label: "Symbols", action: () => setShowSymbolPanel(p => !p) },\n',
    '            { icon: "▭", label: "Handle", action: () => setShowHandlePanel(p => !p) },\n',
    '            { icon: "⊞", label: "Table", action: () => setShowTablePanel(p => !p) },\n',
    '            { icon: "⣿", label: "Barcode", action: () => setShowBarcodePanel(p => !p) },\n',
    '          ].map(btn => (\n',
    '            <button key={btn.label} onClick={btn.action} title={btn.label}\n',
    '              className="w-11 h-11 flex flex-col items-center justify-center rounded-lg text-xs transition-all hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800">\n',
    '              <span className="text-sm leading-none">{btn.icon}</span>\n',
    '              <span className="text-[8px] mt-0.5 font-medium">{btn.label}</span>\n',
    '            </button>\n',
    '          ))}\n',
]

# Remove L2228-L2248 (index 2227-2247) and replace with new_block
result = lines[:2227] + new_block + lines[2248:]

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.writelines(result)

print("FIXED: Merged PACKAGE into DESIGN, QR icon for Barcode")
print("  DESIGN: Select, Text, Image, Shapes, Symbols, Handle, Table, Barcode")
print(f"Total lines: {len(result)}")
