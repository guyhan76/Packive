import os, glob

# Check all .ts and .tsx files in src/ for BOM or CR
problems = []
for pattern in ['src/**/*.ts', 'src/**/*.tsx']:
    for fpath in glob.glob(pattern, recursive=True):
        with open(fpath, 'rb') as f:
            raw = f.read(4)
        has_bom = raw[:3] == b'\xef\xbb\xbf'
        with open(fpath, 'rb') as f:
            content = f.read()
        has_cr = b'\r' in content
        if has_bom or has_cr:
            problems.append((fpath, has_bom, has_cr, len(content)))

if problems:
    print(f"Found {len(problems)} files with encoding issues:")
    for fpath, bom, cr, size in problems:
        print(f"  {fpath} - BOM:{bom} CR:{cr} size:{size}")
        # Fix them
        with open(fpath, 'rb') as f:
            raw = f.read()
        if raw.startswith(b'\xef\xbb\xbf'):
            raw = raw[3:]
        text = raw.decode('utf-8').replace('\r\n', '\n').replace('\r', '\n')
        with open(fpath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(text)
        print(f"    Fixed: {fpath}")
else:
    print("No BOM/CR issues found in src/ files")

# Also check bleed-guide specifically
with open('src/lib/bleed-guide.ts', 'rb') as f:
    raw = f.read()
print(f"\nbleed-guide.ts: {len(raw)} bytes, BOM:{raw[:3]==b'\\xef\\xbb\\xbf'}, CR:{b'\\r' in raw}")
# Check for any non-UTF8 or weird chars
try:
    text = raw.decode('utf-8')
    print("  UTF-8 decode: OK")
except:
    print("  UTF-8 decode: FAILED")
    # Force clean rewrite
    text = raw.decode('utf-8', errors='replace')
    with open('src/lib/bleed-guide.ts', 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)
    print("  Rewrote with replacements")
