with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Remove Picker button (L2198-2212) and Delete button (L2213-2217)
# That's lines index 2197 to 2216 (0-based)

# Find exact boundaries
picker_start = None
delete_end = None

for i, line in enumerate(lines):
    if "TOOLS" in line and "text-[7px]" in line and i > 2190 and i < 2200:
        picker_start = i  # TOOLS label
    if 'font-medium">Delete</span>' in line:
        delete_end = i + 1  # </button> after Delete

if picker_start and delete_end:
    print(f'Removing L{picker_start+1} to L{delete_end+1}')
    del lines[picker_start:delete_end+1]
    print(f'Removed {delete_end+1 - picker_start} lines')
else:
    print(f'picker_start={picker_start}, delete_end={delete_end}')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(''.join(lines))
print(f'Total lines: {len(lines)}')
