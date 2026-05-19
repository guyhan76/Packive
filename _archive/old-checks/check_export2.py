with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show handleExport function (L1747 ~ L1820 approx)
print('=== handleExport function ===')
for i in range(1746, min(1820, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:180]}')

print('\n\n=== convertToPath function ===')
for i in range(1020, min(1100, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:180]}')
