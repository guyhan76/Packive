with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# The right panel is w-80 (320px)
# Header right icons need to be inside a w-80 container that aligns with the panel below

old_right = '''        {/* RIGHT: Undo/Redo + Zoom + Save/Export */}
        <div className="flex items-center gap-0.5">'''

new_right = '''        {/* RIGHT: Undo/Redo + Zoom + Save/Export - aligned with right panel (w-80) */}
        <div className="flex items-center justify-end gap-0.5 w-80 shrink-0">'''

if old_right in content:
    content = content.replace(old_right, new_right)
    print("FIXED: Right icons container set to w-80 to match right panel")
else:
    print("NOT FOUND")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
