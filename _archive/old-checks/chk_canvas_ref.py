with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find canvas ref variable
print("=== Canvas ref ===")
for i, line in enumerate(lines):
    s = line.rstrip()
    if i < 200 and ('useRef' in s) and ('canvas' in s.lower() or 'fabric' in s.lower() or 'fc' in s.lower()):
        print(f"L{i+1}: {s[:250]}")

print("\n=== new Canvas / new fabric.Canvas ===")
for i, line in enumerate(lines):
    s = line.rstrip()
    if 'new ' in s and 'Canvas' in s and i < 1500:
        print(f"L{i+1}: {s[:250]}")

print("\n=== .current = ===")
for i, line in enumerate(lines):
    s = line.rstrip()
    if '.current =' in s and ('canvas' in s.lower() or 'fabric' in s.lower() or 'Ref' in s) and i < 1500:
        print(f"L{i+1}: {s[:250]}")
