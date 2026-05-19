with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'fontCategory' in line and ('all' in line or 'en' in line or 'ko' in line or 'ja' in line or 'calli' in line):
        if 'useState' in line or 'button' in line.lower() or '===' in line:
            print(f'L{i+1}: {line.rstrip()[:160]}')
