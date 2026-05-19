with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Check if there's already a Symbols button with setShowSymbolPanel
for i, line in enumerate(lines):
    if 'setShowSymbolPanel' in line:
        print(f'L{i+1}: {line.rstrip()[:160]}')

# Check where the ⚠ Symbols button is
for i, line in enumerate(lines):
    if 'Symbols' in line and 'button' in line:
        print(f'L{i+1}: {line.rstrip()[:160]}')
