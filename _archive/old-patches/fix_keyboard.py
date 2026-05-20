with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the cleanup return block (L1272-L1279)
# We need to add removeEventListener for onKeyDown and onKeyUp before the existing cleanup

fixed = False
for i in range(len(lines)):
    # Find: return () => {
    #   disposed = true; ...resizeObserver...
    if 'disposed = true;' in lines[i] and 'resizeTimer' in lines[i] and 'resizeObserver' in lines[i]:
        # Insert keyboard cleanup before this line
        indent = '      '
        cleanup_lines = (
            indent + '  document.removeEventListener("keydown", onKeyDown);\n' +
            indent + '  document.removeEventListener("keyup", onKeyUp);\n'
        )
        # Insert after "return () => {" which is on the previous line
        # The line before should be "return () => {"
        if 'return () => {' in lines[i-1]:
            lines.insert(i, cleanup_lines)
            fixed = True
            print(f'Inserted keyboard cleanup at L{i+1}')
            break
        else:
            # return () => { and disposed on same line
            # Split it
            old_line = lines[i]
            if 'return () => {' in old_line:
                parts = old_line.split('return () => {')
                lines[i] = parts[0] + 'return () => {\n' + cleanup_lines + indent + '  ' + parts[1].lstrip()
                fixed = True
                print(f'Fixed inline cleanup at L{i+1}')
                break

if not fixed:
    # Alternative: find the exact cleanup block
    for i in range(len(lines)):
        if 'return () => {' in lines[i]:
            # Check if next lines have disposed/resizeObserver
            block = ''.join(lines[i:i+5])
            if 'disposed' in block and 'fcRef' in block:
                lines.insert(i+1, '        document.removeEventListener("keydown", onKeyDown);\n')
                lines.insert(i+2, '        document.removeEventListener("keyup", onKeyUp);\n')
                fixed = True
                print(f'Inserted keyboard cleanup after L{i+1}')
                break

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

# Verify
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

remove_count = src.count('removeEventListener("keydown"')
add_count = src.count('addEventListener("keydown"')
print(f'\naddEventListener("keydown"): {add_count}')
print(f'removeEventListener("keydown"): {remove_count}')
print(f'Balanced: {add_count == remove_count}')

# Show the cleanup area
lines2 = src.split('\n')
for j in range(len(lines2)):
    if 'removeEventListener("keydown", onKeyDown)' in lines2[j]:
        for k in range(max(0,j-2), min(len(lines2), j+8)):
            print(f'L{k+1}: {lines2[k].rstrip()[:160]}')
        break
