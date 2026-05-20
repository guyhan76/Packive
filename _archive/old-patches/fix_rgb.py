with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and remove the DeviceRGB blanket replacement block
start = None
end = None
for i, line in enumerate(lines):
    if 'Step 7b' in line and 'DeviceRGB' in line:
        start = i
    if start is not None and 'Step 8: CMYK conversion complete' in line:
        end = i
        break

if start is not None and end is not None:
    # Replace the block with safe comment + the Step 8 log line
    replacement = [
        '  // Step 7b: Image XObjects kept as DeviceRGB (vector colors already CMYK via replacePdfColorsInString)\n',
        '  console.log("[PDF] Step 8: CMYK conversion complete, length:", rawPdf.length);\n',
    ]
    lines[start:end+1] = replacement
    print(f'Removed L{start+1} to L{end+1}')
else:
    print(f'Block not found: start={start}, end={end}')
    for i, line in enumerate(lines):
        if 'DeviceRGB' in line or 'DeviceCMYK' in line:
            print(f'L{i+1}: {line.rstrip()[:120]}')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()
print(f'DeviceCMYK refs: {src.count("DeviceCMYK")}')
print(f'Total lines: {len(src.splitlines())}')
