with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find L4481 - the broken line with backslash-t
target = None
for i, line in enumerate(lines):
    if i >= 4470 and i <= 4500:
        if 'className={' in line and 'ext-[10px] px-1 py-0.5 rounded' in line:
            target = i
            print(f'Found broken line at L{i+1}: {repr(line[:80])}')
            break

if target is None:
    print('Broken line not found in expected range')
    exit()

# Replace just this one line - fix the className
lines[target] = '                    <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">{\n'

print(f'Fixed L{target+1}')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print(f'Total lines: {len(lines)}')
