with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Replace the emoji with ▭
old = '{ icon: "\u270B", label: "Handle"'
new = '{ icon: "▭", label: "Handle"'

if old in src:
    src = src.replace(old, new)
    print("Replaced emoji with ▭")
else:
    print("Emoji not found, checking...")
    # Try finding Handle button
    if '"Handle"' in src and 'icon:' in src:
        import re
        src = re.sub(r'\{ icon: "[^"]+", label: "Handle"', '{ icon: "▭", label: "Handle"', src)
        print("Replaced via regex")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
