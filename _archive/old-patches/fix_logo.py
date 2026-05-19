with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Replace text "Packive" with logo image
old_logo = '<span className="text-[13px] font-black tracking-tight text-gray-800 select-none">Packive</span>'
new_logo = '<img src="/packive-logo.png" alt="Packive" className="h-5 select-none" draggable={false} />'

if old_logo in content:
    content = content.replace(old_logo, new_logo)
    print("FIXED: Replaced text logo with image logo")
else:
    print("NOT FOUND")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)

print(f"Total lines: {len(content.split(chr(10)))}")
