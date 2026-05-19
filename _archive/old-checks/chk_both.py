with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print all lines with Full Cut and Half Cut SVG definitions
for i, line in enumerate(lines):
    if i > 2475 and i < 2500:
        if 'viewBox' in line or 'scaleToWidth' in line:
            print(f'L{i+1}: {line.rstrip()[:200]}')
