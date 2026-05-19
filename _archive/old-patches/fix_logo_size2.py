with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

old = '<img src="/packive-logo.png" alt="Packive" className="h-8 select-none" draggable={false} />'
new = '<img src="/packive-logo.png" alt="Packive" className="h-[28px] select-none" draggable={false} />'

if old in content:
    content = content.replace(old, new)
    print("FIXED: Logo size h-8 -> h-[28px]")
else:
    print("NOT FOUND")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
