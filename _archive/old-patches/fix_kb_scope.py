with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Strategy: Store refs outside boot() so cleanup can access them
# Find the useEffect that contains boot() - starts around L854
# Find "const boot = async" line
boot_line = None
for i in range(len(lines)):
    if 'const boot = async' in lines[i]:
        boot_line = i
        print(f'boot() starts at L{i+1}')
        break

# Find the useEffect start (search backwards)
effect_line = None
for i in range(boot_line, 0, -1):
    if 'useEffect' in lines[i]:
        effect_line = i
        print(f'useEffect starts at L{i+1}')
        break

# Insert ref variables right after useEffect(() => {
# Add: let _onKeyDown: any = null; let _onKeyUp: any = null;
indent = '    '
ref_line = indent + 'let _onKeyDown: ((e: KeyboardEvent) => void) | null = null;\n'
ref_line += indent + 'let _onKeyUp: ((e: KeyboardEvent) => void) | null = null;\n'
lines.insert(effect_line + 1, ref_line)
print(f'Inserted refs after L{effect_line + 1}')

# Now find onKeyDown definition and add assignment
# After insert, line numbers shifted by 1
for i in range(len(lines)):
    if 'const onKeyDown = (e: KeyboardEvent)' in lines[i]:
        # Add _onKeyDown = onKeyDown; after the line
        next_line = lines[i+1] if i+1 < len(lines) else ''
        if 'const onKeyUp' in next_line:
            # Insert assignments after onKeyUp
            for j in range(i, len(lines)):
                if 'const onKeyUp' in lines[j]:
                    assign = '      _onKeyDown = onKeyDown; _onKeyUp = onKeyUp;\n'
                    lines.insert(j+1, assign)
                    print(f'Inserted assignments after L{j+1}')
                    break
            break

# Fix cleanup to use the refs
for i in range(len(lines)):
    if 'removeEventListener("keydown", onKeyDown)' in lines[i]:
        lines[i] = lines[i].replace('onKeyDown)', '_onKeyDown!)')
        print(f'Fixed cleanup keydown at L{i+1}')
    if 'removeEventListener("keyup", onKeyUp)' in lines[i]:
        lines[i] = lines[i].replace('onKeyUp)', '_onKeyUp!)')
        print(f'Fixed cleanup keyup at L{i+1}')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

# Verify
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

print(f'\n_onKeyDown refs: {src.count("_onKeyDown")}')
print(f'_onKeyUp refs: {src.count("_onKeyUp")}')
