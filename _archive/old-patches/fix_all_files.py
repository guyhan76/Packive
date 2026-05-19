import os

count = 0
fixed = 0
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next']]
    for fname in files:
        fpath = os.path.join(root, fname)
        with open(fpath, 'rb') as f:
            raw = f.read()
        needs_fix = False
        if raw.startswith(b'\xef\xbb\xbf'):
            needs_fix = True
        if b'\r' in raw:
            needs_fix = True
        if needs_fix:
            count += 1
            if raw.startswith(b'\xef\xbb\xbf'):
                raw = raw[3:]
            try:
                text = raw.decode('utf-8')
            except:
                text = raw.decode('utf-8', errors='replace')
            text = text.replace('\r\n', '\n').replace('\r', '\n')
            with open(fpath, 'w', encoding='utf-8', newline='\n') as f:
                f.write(text)
            fixed += 1
            print(f'  Fixed: {fpath}')

print(f'\nChecked all src/ files. Fixed {fixed} remaining issues.')

# 3. Also check root config files
for fname in ['next.config.js', 'next.config.mjs', 'next.config.ts', 'tsconfig.json', 'package.json', 'tailwind.config.ts', 'postcss.config.js', 'postcss.config.mjs']:
    fpath = fname
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'rb') as f:
        raw = f.read()
    has_bom = raw.startswith(b'\xef\xbb\xbf')
    has_cr = b'\r' in raw
    if has_bom or has_cr:
        if has_bom:
            raw = raw[3:]
        text = raw.decode('utf-8').replace('\r\n', '\n').replace('\r', '\n')
        with open(fpath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(text)
        print(f'  Fixed root config: {fpath} (BOM:{has_bom} CR:{has_cr})')
    else:
        print(f'  OK: {fpath}')
