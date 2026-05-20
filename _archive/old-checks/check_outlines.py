import os

path = 'src/lib/text-to-outlines.ts'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    lines = content.split('\n')
    print(f'File: {len(lines)} lines, {len(content)} chars')
    for i, line in enumerate(lines):
        print(f'L{i+1}: {line.rstrip()[:180]}')
else:
    print('text-to-outlines.ts NOT FOUND')
    for root, dirs, files in os.walk('src/lib'):
        for f in files:
            if 'outline' in f.lower() or 'text' in f.lower():
                print(f'Found: {os.path.join(root, f)}')
