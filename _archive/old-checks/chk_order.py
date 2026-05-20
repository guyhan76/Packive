with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Find the buttons array area - get more context
lines = src.split('\n')
for i, line in enumerate(lines):
    if '{ icon: "↖", label: "Select"' in line:
        start = i
    if '{ icon: "📦", label: "Box"' in line:
        end = i
        break

print("=== Current button order ===")
for i in range(start, end+2):
    print(f"L{i+1}: {lines[i].rstrip()[:160]}")
