with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Remove the "Packive" text span, keep only the logo icon
old = '<img src="/packive-logo.png" alt="Packive" className="h-6 w-6 object-contain" /><span className="text-sm font-semibold text-gray-800">Packive</span>'
new = '<img src="/packive-logo.png" alt="Packive" className="h-7 object-contain" />'

if old in content:
    content = content.replace(old, new)
    print("FIXED: Removed Packive text, logo only (h-7 = 28px)")
else:
    print("NOT FOUND")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
