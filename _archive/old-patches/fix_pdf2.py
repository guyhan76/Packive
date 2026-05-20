with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the broken area: between original setProperties '});' and 'const pdfArrayBuffer'
# Remove duplicate/reversed setProperties block

start_remove = None
end_remove = None

for i in range(len(lines)):
    # Find first '});' after original setProperties (around L559)
    if i >= 555 and lines[i].strip() == '});' and start_remove is None:
        # Check if next lines are the broken reversed block
        next_few = ''.join(lines[i+1:i+10])
        if 'keywords' in next_few and 'FOGRA39' in next_few:
            start_remove = i + 1  # Start removing after this '});'
            break

if start_remove:
    for i in range(start_remove, len(lines)):
        if 'const pdfArrayBuffer' in lines[i]:
            end_remove = i
            break

if start_remove and end_remove:
    print(f'Removing L{start_remove+1} to L{end_remove}: {end_remove - start_remove} lines')
    del lines[start_remove:end_remove]
    # Insert clean blank line
    lines.insert(start_remove, '\n')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

# Verify
with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    vlines = f.readlines()

print(f'Total lines: {len(vlines)}')
for i in range(553, min(575, len(vlines))):
    print(f'L{i+1}: {vlines[i].rstrip()[:150]}')
