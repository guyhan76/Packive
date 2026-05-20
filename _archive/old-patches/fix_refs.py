with open('src/lib/preflight.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixes = 0
for i in range(len(lines)):
    # Find lines with objectName: name, but no objectRef on next line
    if 'objectName: name,' in lines[i]:
        next_line = lines[i+1] if i+1 < len(lines) else ''
        if 'objectRef' not in next_line:
            # Insert objectRef after objectName
            indent = lines[i][:len(lines[i]) - len(lines[i].lstrip())]
            lines.insert(i+1, indent + 'objectRef: objRef,\n')
            fixes += 1
            print(f'Fix L{i+1}: added objectRef')

with open('src/lib/preflight.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f'\nTotal fixes: {fixes}')

# Verify
with open('src/lib/preflight.ts', 'r', encoding='utf-8') as f:
    src = f.read()
print(f'objectRef count: {src.count("objectRef")}')
