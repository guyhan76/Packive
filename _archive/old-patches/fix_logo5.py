with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

old = 'className="h-7 object-contain"'
new = 'className="h-14 object-contain"'

if old in content:
    content = content.replace(old, new)
    print("FIXED: Logo size h-7 (28px) -> h-14 (56px)")
else:
    print("NOT FOUND")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
