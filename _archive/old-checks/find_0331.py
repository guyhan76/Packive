import os
from datetime import datetime

# Search more broadly for any recent backup
search_dirs = [
    r'C:\Users\user\Desktop',
    r'C:\Users\user\Documents',
    r'C:\Users\user\Downloads',
    r'C:\Users\user',
]

for base in search_dirs:
    if not os.path.exists(base): continue
    for item in os.listdir(base):
        full = os.path.join(base, item)
        if os.path.isdir(full) and 'packive' in item.lower() and 'backup' in item.lower():
            mtime = datetime.fromtimestamp(os.path.getmtime(full))
            if mtime.month == 3 and mtime.day >= 29:
                print(f"FOUND: {full} (modified: {mtime})")

# Also check if there's a 0331 zip or tar
for base in search_dirs:
    if not os.path.exists(base): continue
    for item in os.listdir(base):
        if '0331' in item or 'backup' in item.lower():
            full = os.path.join(base, item)
            mtime = datetime.fromtimestamp(os.path.getmtime(full))
            if mtime.month == 3 and mtime.day >= 29:
                print(f"FOUND: {full} ({os.path.getsize(full) if os.path.isfile(full) else 'dir'}, modified: {mtime})")
