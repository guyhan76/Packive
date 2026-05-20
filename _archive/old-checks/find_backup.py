import os, shutil

# Find most recent backup
backups = [
    r'C:\Users\user\Desktop\dev\packive-backup-20260328-multipart-fit',
    r'C:\Users\user\Desktop\dev\packive-backup-20260328-dieline-info-panel',
    r'C:\Users\user\Desktop\dev\packive-backup-20260328',
    r'C:\Users\user\Desktop\dev\backups\packive_backup_phase4_complete_20260322_234125',
]

# Find which backups exist and their modification times
for bak in backups:
    if os.path.exists(bak):
        mtime = os.path.getmtime(bak)
        from datetime import datetime
        dt = datetime.fromtimestamp(mtime)
        # Count files
        file_count = sum(len(files) for _, _, files in os.walk(bak))
        print(f"{bak}")
        print(f"  Modified: {dt}")
        print(f"  Files: {file_count}")
        # Check key files
        for key in ['src/components/editor/unified-editor.tsx', 'src/lib/dieline-templates.ts', 'src/lib/packaging-symbols.ts']:
            p = os.path.join(bak, key)
            if os.path.exists(p):
                print(f"  {key}: {os.path.getsize(p)} bytes")
            else:
                print(f"  {key}: MISSING")
        print()
