with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Find the current logo img tag and replace with logo + text
old = '<img src="/packive-logo.png" alt="Packive" className="h-[28px] object-contain" />'

# Logo icon (square) + "Packive" text, matching Back button size
new = '<img src="/packive-logo.png" alt="Packive" className="h-6 w-6 object-contain" /><span className="text-sm font-semibold text-gray-800">Packive</span>'

if old in content:
    content = content.replace(old, new)
    print("FIXED: Logo = 24px icon + Packive text")
else:
    # Try broader search
    import re
    pattern = r'<img src="/packive-logo\.png"[^/]*/>'
    match = re.search(pattern, content)
    if match:
        print(f"Found: {match.group()[:100]}")
        content = content.replace(match.group(), new)
        print("FIXED: Logo replaced with icon + text")
    else:
        print("NOT FOUND")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
