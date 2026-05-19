import os

path = 'src/lib/dieline-templates.ts'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    print(f"=== {path} ({len(content)} bytes, {len(content.splitlines())} lines) ===")
    # Find box3dPath and svgPath references
    for i, line in enumerate(content.split('\n')):
        if any(k in line for k in ['box3dPath', 'svgPath', 'box3d', 'previews', 'png']):
            print(f"L{i+1}: {line.rstrip()[:200]}")
else:
    print(f"{path} NOT FOUND")
