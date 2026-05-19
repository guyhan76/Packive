import os

folder = 'public/symbols'
files = sorted(os.listdir(folder))
for f in files:
    if f.endswith('.svg'):
        path = os.path.join(folder, f)
        with open(path, 'r', encoding='utf-8') as fh:
            content = fh.read()
        print(f'{f}: {len(content)} bytes, starts with: {content[:80]}')
