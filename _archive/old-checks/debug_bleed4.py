with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

old = 'fcRef.current = canvas;'
new = 'fcRef.current = canvas; (window as any).__pc = canvas;'

if '(window as any).__pc' not in content:
    content = content.replace(old, new, 1)
    print("Fix: Canvas exposed as window.__pc at L959")
else:
    print("Already added")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
