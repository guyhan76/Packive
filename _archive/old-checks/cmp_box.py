import os

# Compare current box3d images with backup
current = 'public/dielines/box3d'
backup = r'C:\Users\user\Desktop\dev\packive-backup-20260328\public\dielines\box3d'

if os.path.exists(backup):
    cur_files = {f: os.path.getsize(os.path.join(current, f)) for f in os.listdir(current)}
    bak_files = {f: os.path.getsize(os.path.join(backup, f)) for f in os.listdir(backup)} if os.path.exists(backup) else {}
    
    print("=== Comparison: current vs backup ===")
    all_files = sorted(set(list(cur_files.keys()) + list(bak_files.keys())))
    for f in all_files:
        cur_size = cur_files.get(f, -1)
        bak_size = bak_files.get(f, -1)
        if cur_size != bak_size:
            status = "DIFFERENT" if cur_size > 0 and bak_size > 0 else ("NEW" if bak_size < 0 else "MISSING")
            print(f"  {status}: {f} (cur={cur_size}, bak={bak_size})")
        else:
            print(f"  OK: {f} ({cur_size} bytes)")
else:
    print(f"Backup not found at {backup}")
    # Check if images exist in current
    for f in sorted(os.listdir(current)):
        print(f"  {f}: {os.path.getsize(os.path.join(current, f))} bytes")
