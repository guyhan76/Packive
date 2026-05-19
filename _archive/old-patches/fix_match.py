with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Fix Full Cut PREVIEW to match viewBox 0 0 140 55 (same as Half Cut)
old_full_preview = 'viewBox="0 0 140 50" className="w-full h-10"><rect x="15" y="5" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" strokeWidth="2"/>'
new_full_preview = 'viewBox="0 0 140 55" className="w-full h-10"><rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" strokeWidth="2"/>'

if old_full_preview in src:
    src = src.replace(old_full_preview, new_full_preview)
    print("Fixed Full Cut preview viewBox to match Half Cut")
else:
    print("Full Cut preview not found")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
