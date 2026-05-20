import os, hashlib

# Check current box3d files and their hashes
box3d = r'C:\Users\user\Desktop\dev\packive\public\dielines\box3d'
backup_box3d = r'C:\Users\user\Desktop\dev\packive-backup-20260328\public\dielines\box3d'

def get_hash(path):
    with open(path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

print("=== Current box3d ===")
cur_files = {}
for f in sorted(os.listdir(box3d)):
    full = os.path.join(box3d, f)
    h = get_hash(full)
    s = os.path.getsize(full)
    cur_files[f] = (h, s)
    print(f"  {f}: {s} bytes, md5={h}")

if os.path.exists(backup_box3d):
    print("\n=== Backup box3d ===")
    for f in sorted(os.listdir(backup_box3d)):
        full = os.path.join(backup_box3d, f)
        h = get_hash(full)
        s = os.path.getsize(full)
        if f in cur_files:
            if cur_files[f][0] != h:
                print(f"  CHANGED: {f} (bak={s}, cur={cur_files[f][1]})")
            else:
                print(f"  OK: {f}")
        else:
            print(f"  MISSING in current: {f}")
else:
    print(f"\nBackup box3d not found at {backup_box3d}")
    # Try checking if images are actually the correct ones by looking at file headers
    print("\n=== Checking PNG headers ===")
    for f in sorted(os.listdir(box3d)):
        full = os.path.join(box3d, f)
        with open(full, 'rb') as fh:
            header = fh.read(8)
        is_png = header[:4] == b'\x89PNG'
        print(f"  {f}: {'PNG' if is_png else 'NOT PNG'} ({os.path.getsize(full)} bytes)")
