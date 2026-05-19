with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

print("=== All useRef (first 200 lines) ===")
for i, line in enumerate(lines):
    if i < 200 and 'useRef' in line:
        print(f"L{i+1}: {line.rstrip()[:250]}")

print("\n=== new Canvas (all lines) ===")
for i, line in enumerate(lines):
    if 'new ' in line and 'anvas' in line:
        print(f"L{i+1}: {line.rstrip()[:250]}")

print("\n=== Ref.current = (first 1500 lines) ===")
for i, line in enumerate(lines):
    if i < 1500 and 'Ref.current' in line and '=' in line and '===' not in line and '!==' not in line:
        print(f"L{i+1}: {line.rstrip()[:250]}")
