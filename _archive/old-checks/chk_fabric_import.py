with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find where fabric module is stored (fabricModRef or similar)
for i, line in enumerate(lines):
    if any(k in line for k in ['fabricMod', 'fabric.Group', 'fabric.Canvas', 'import.*fabric', 'require.*fabric', 'FabricGroup']):
        print(f"L{i+1}: {line.rstrip()[:200]}")
    if 'fabricModRef' in line and i < 100:
        print(f"L{i+1}: {line.rstrip()[:200]}")

# Find where fabric is dynamically imported
print("\n=== Dynamic import ===")
for i, line in enumerate(lines):
    if 'import(' in line and 'fabric' in line:
        print(f"L{i+1}: {line.rstrip()[:200]}")
    if 'fabricModRef.current' in line and i < 200:
        print(f"L{i+1}: {line.rstrip()[:200]}")
