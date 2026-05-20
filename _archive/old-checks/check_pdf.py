import os

path = 'src/lib/pdf-cmyk-export.ts'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    print(f'File: {len(lines)} lines')
    
    # Find font/text related code
    for i, line in enumerate(lines):
        if any(kw in line.lower() for kw in ['font', 'text', 'itext', 'textbox', 'glyph', 'opentype', 'path', 'tosvg', 'outline']):
            print(f'L{i+1}: {line.rstrip()[:180]}')
else:
    print('pdf-cmyk-export.ts NOT FOUND')
    # Search for alternative
    for root, dirs, files in os.walk('src/lib'):
        for f in files:
            if 'pdf' in f.lower() or 'export' in f.lower():
                print(f'Found: {os.path.join(root, f)}')
