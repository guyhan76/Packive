import os

# Try the other backup
backup = r'C:\Users\user\Desktop\dev\backups\packive_backup_phase4_complete_20260322_234125\public\dielines'
current = r'public\dielines'

# Compare box3d
bak_box3d = os.path.join(backup, 'box3d')
if os.path.exists(bak_box3d):
    bak_files = {f: os.path.getsize(os.path.join(bak_box3d, f)) for f in os.listdir(bak_box3d)}
    cur_files = {f: os.path.getsize(os.path.join(current, 'box3d', f)) for f in os.listdir(os.path.join(current, 'box3d'))}
    
    changed = []
    for f in sorted(set(list(cur_files.keys()) + list(bak_files.keys()))):
        cs = cur_files.get(f, -1)
        bs = bak_files.get(f, -1)
        if cs != bs:
            changed.append(f"  {f}: cur={cs}, bak={bs}")
    
    if changed:
        print(f"CHANGED box3d files ({len(changed)}):")
        for c in changed: print(c)
    else:
        print("All box3d images IDENTICAL to backup")
else:
    print(f"Backup box3d not found")

# Compare previews
bak_prev = os.path.join(backup, 'previews')
if os.path.exists(bak_prev):
    bak_files = {f: os.path.getsize(os.path.join(bak_prev, f)) for f in os.listdir(bak_prev)}
    cur_files = {f: os.path.getsize(os.path.join(current, 'previews', f)) for f in os.listdir(os.path.join(current, 'previews'))}
    
    changed = []
    for f in sorted(set(list(cur_files.keys()) + list(bak_files.keys()))):
        cs = cur_files.get(f, -1)
        bs = bak_files.get(f, -1)
        if cs != bs:
            changed.append(f"  {f}: cur={cs}, bak={bs}")
    
    if changed:
        print(f"\nCHANGED preview files ({len(changed)}):")
        for c in changed: print(c)
    else:
        print("\nAll preview SVGs IDENTICAL to backup")
