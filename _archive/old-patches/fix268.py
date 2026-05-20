with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace L268, L269, L270 with single fixed line
lines[267] = '    const streamKeyRN = find("stream\\x0D\\x0A", ds);\n'
lines[268] = ''
lines[269] = ''

# Remove empty lines
new_lines = [l for l in lines if l != '']

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

# Verify
with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    vlines = f.readlines()
for i in range(265, min(275, len(vlines))):
    print(f'L{i+1}: {repr(vlines[i][:100])}')
print(f'Total lines: {len(vlines)}')
