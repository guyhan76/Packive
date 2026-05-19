with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Rewrite L2202 clean - ensure no hidden characters
new_line = '        <input ref={fileLoadRef} type="file" accept=".json,.pkv.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (window.confirm("Loading will replace current canvas. Continue?")) { fileLoad(f); } } e.target.value = ""; }} />\n'

lines[2201] = new_line
print(f"Rewrote L2202: {len(new_line)} chars")

# Also check L2201 ends properly
print(f"L2201 ends with: {repr(lines[2200][-20:])}")
print(f"L2203 starts with: {repr(lines[2202][:40])}")

# Write back with consistent line endings (LF only)
content = ''.join(lines)
# Normalize to LF
content = content.replace('\r\n', '\n').replace('\r', '\n')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8', newline='') as f:
    f.write(content)

print("File rewritten with LF line endings")
print(f"Total lines: {len(content.split(chr(10)))}")
