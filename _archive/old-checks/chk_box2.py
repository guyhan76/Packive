import os

# Find box-type-selector.tsx
path = 'src/components/editor/box-type-selector.tsx'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    print(f"=== {path} ({len(content)} bytes) ===")
    # Find image references
    for i, line in enumerate(content.split('\n')):
        if any(k in line for k in ['img', 'src=', 'png', 'svg', 'image', '3d', '3D', 'box3d', 'preview']):
            print(f"L{i+1}: {line.rstrip()}")
else:
    print(f"{path} NOT FOUND")

# Check box3d folder
box3d = 'public/dielines/box3d'
if os.path.exists(box3d):
    files = sorted(os.listdir(box3d))
    print(f"\n=== {box3d} ({len(files)} files) ===")
    for f in files:
        size = os.path.getsize(os.path.join(box3d, f))
        print(f"  {f} ({size} bytes)")

# Check previews folder
previews = 'public/dielines/previews'
if os.path.exists(previews):
    files = sorted(os.listdir(previews))
    print(f"\n=== {previews} ({len(files)} files) ===")
    for f in files:
        size = os.path.getsize(os.path.join(previews, f))
        print(f"  {f} ({size} bytes)")
