with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find ALL lines with the broken pattern
for i, line in enumerate(lines):
    if 'ext-[10px]' in line and 'className' in line:
        print(f'=== Found at L{i+1} ===')
        for j in range(i, min(i+16, len(lines))):
            print(f'L{j+1}: {repr(lines[j][:140])}')
        print()
