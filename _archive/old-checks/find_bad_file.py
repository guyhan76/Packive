import os, subprocess, shutil

# Find the problematic file by temporarily renaming large source files
# and testing build each time

suspects = []
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next']]
    for fname in files:
        if fname.endswith(('.ts', '.tsx')) and not fname.endswith('.d.ts'):
            fpath = os.path.join(root, fname)
            size = os.path.getsize(fpath)
            suspects.append((fpath, size))

# Sort by size descending - largest files most likely to cause issues
suspects.sort(key=lambda x: -x[1])

print(f"Checking {len(suspects)} source files, largest first:")
for fpath, size in suspects[:10]:
    print(f"  {fpath}: {size:,} bytes")

# Check each file for problematic characters
print("\nScanning for non-UTF8 or unusual characters...")
for fpath, size in suspects:
    with open(fpath, 'rb') as f:
        raw = f.read()
    
    # Check for null bytes
    if b'\x00' in raw:
        print(f"  NULL BYTES: {fpath} ({raw.count(b'\x00')} nulls)")
    
    # Check for BOM (should be fixed already)
    if raw.startswith(b'\xef\xbb\xbf'):
        print(f"  BOM: {fpath}")
    
    # Check for CR
    if b'\r' in raw:
        print(f"  CR: {fpath}")
    
    # Check for non-UTF8
    try:
        raw.decode('utf-8')
    except UnicodeDecodeError as e:
        print(f"  BAD UTF8: {fpath} at position {e.start}")
    
    # Check for unusual control chars (except \n and \t)
    for i, b in enumerate(raw):
        if b < 32 and b not in (10, 9):  # not \n or \t
            print(f"  CONTROL CHAR 0x{b:02x} at byte {i}: {fpath}")
            break

print("\nDone scanning.")
