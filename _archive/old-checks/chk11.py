with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find showSymbolPanel panel
for i, line in enumerate(lines):
    if 'showSymbolPanel && (' in line:
        print(f'Panel at L{i+1}')
        # Show 5 lines before to see parent context
        for j in range(max(0,i-5), min(i+3, len(lines))):
            print(f'L{j+1}: {lines[j].rstrip()[:160]}')
        break

print()
# Find showBarcodePanel for comparison
for i, line in enumerate(lines):
    if 'showBarcodePanel && (' in line:
        print(f'Barcode at L{i+1}')
        for j in range(max(0,i-5), min(i+3, len(lines))):
            print(f'L{j+1}: {lines[j].rstrip()[:160]}')
        break

print()
# Find showTablePanel for comparison
for i, line in enumerate(lines):
    if 'showTablePanel && (' in line:
        print(f'Table at L{i+1}')
        for j in range(max(0,i-5), min(i+3, len(lines))):
            print(f'L{j+1}: {lines[j].rstrip()[:160]}')
        break
