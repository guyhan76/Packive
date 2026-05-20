with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'ext-[10px] px-1 py-0.5 rounded' in line and '{  ext-' in line:
        print(f'L{i+1} BEFORE: {line.rstrip()[:150]}')
        lines[i] = line.replace('{  ext-[10px]', '{	ext-[10px]')
        print(f'L{i+1} AFTER: {lines[i].rstrip()[:150]}')
        break

# Also check if closing backtick exists
for i, line in enumerate(lines):
    if 'text-gray-400"' in line and '}}' not in line and 'bg-gray-50' in line:
        if not '}' in line:
            lines[i] = line.replace('"}', '"}')
            print(f'L{i+1} Fixed closing backtick')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Done')
