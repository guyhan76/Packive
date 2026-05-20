with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

lines = src.split('\n')

# Find PDF export logic
print('=== PDF Export / font handling ===')
for i, line in enumerate(lines):
    if any(kw in line.lower() for kw in ['pdf', 'jspdf', 'export', 'topdf']):
        if any(kw2 in line.lower() for kw2 in ['font', 'text', 'outline', 'path', 'tosvg', 'todataurl', 'canvas2']):
            print(f'L{i+1}: {line.rstrip()[:180]}')

print('\n=== Export button / function ===')
for i, line in enumerate(lines):
    if 'showExport' in line and ('set' in line or 'onClick' in line):
        print(f'L{i+1}: {line.rstrip()[:150]}')

# Find the main export function
print('\n=== Export function definition ===')
for i, line in enumerate(lines):
    if ('exportPdf' in line or 'exportPNG' in line or 'handleExport' in line) and ('const' in line or 'function' in line or 'async' in line):
        print(f'L{i+1}: {line.rstrip()[:150]}')

# Look for text-to-path or font embedding
print('\n=== Text outline / font embed ===')
for i, line in enumerate(lines):
    if any(kw in line.lower() for kw in ['outline', 'topath', 'fontdata', 'embedfont', 'texttopaths', 'opentype']):
        print(f'L{i+1}: {line.rstrip()[:150]}')
