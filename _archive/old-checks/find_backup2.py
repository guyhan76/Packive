import os
from datetime import datetime

# Search for all backup folders
dev_dir = r'C:\Users\user\Desktop\dev'
for item in sorted(os.listdir(dev_dir)):
    full = os.path.join(dev_dir, item)
    if os.path.isdir(full) and ('backup' in item.lower() or 'packive' in item.lower()):
        mtime = datetime.fromtimestamp(os.path.getmtime(full))
        print(f"{item}  (modified: {mtime})")

# Also check inside backups folder
bak_dir = os.path.join(dev_dir, 'backups')
if os.path.exists(bak_dir):
    print(f"\n=== Inside backups/ ===")
    for item in sorted(os.listdir(bak_dir)):
        full = os.path.join(bak_dir, item)
        if os.path.isdir(full):
            mtime = datetime.fromtimestamp(os.path.getmtime(full))
            print(f"  {item}  (modified: {mtime})")

# Check packive project folder for backup dirs
packive_dir = r'C:\Users\user\Desktop\dev\packive'
print(f"\n=== Inside packive/ ===")
for item in sorted(os.listdir(packive_dir)):
    full = os.path.join(packive_dir, item)
    if os.path.isdir(full) and 'backup' in item.lower():
        mtime = datetime.fromtimestamp(os.path.getmtime(full))
        print(f"  {item}  (modified: {mtime})")
