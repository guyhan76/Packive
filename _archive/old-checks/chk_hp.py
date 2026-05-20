with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

if '{/* Handle Panel */' in src:
    print("Handle panel EXISTS")
else:
    print("Handle panel MISSING")

print(f"Total lines: {len(src.splitlines())}")
