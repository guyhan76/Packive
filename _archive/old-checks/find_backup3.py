import os
from datetime import datetime

# Check inside packive/backups
bak_dir = r'C:\Users\user\Desktop\dev\packive\backups'
if os.path.exists(bak_dir):
    for item in sorted(os.listdir(bak_dir)):
        full = os.path.join(bak_dir, item)
        if os.path.isdir(full):
            mtime = datetime.fromtimestamp(os.path.getmtime(full))
            # Check for key files
            ue = os.path.join(full, 'src', 'components', 'editor', 'unified-editor.tsx')
            has_ue = os.path.exists(ue)
            ue_size = os.path.getsize(ue) if has_ue else 0
            print(f"  {item}  (modified: {mtime}, unified-editor: {ue_size if has_ue else 'MISSING'})")
        elif os.path.isfile(full):
            mtime = datetime.fromtimestamp(os.path.getmtime(full))
            print(f"  {item}  (file, {os.path.getsize(full)} bytes, modified: {mtime})")
else:
    print("packive/backups not found")

# Also search for any 0331 or march-31 backup anywhere
print("\n=== Searching for 0331 backups ===")
for root, dirs, files in os.walk(r'C:\Users\user\Desktop\dev'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git']]
    for d in dirs:
        if '0331' in d or '331' in d or 'march31' in d.lower():
            print(f"  {os.path.join(root, d)}")
    for f in files:
        if '0331' in f or '331' in f:
            print(f"  {os.path.join(root, f)}")
