with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Line 2458 (index 2457) has setShowSymbolPanel(false);
# Line 2459 (index 2458) has className=... which should be on the <button> tag
# We need to insert }}\n between them

for i, line in enumerate(lines):
    if 'setShowSymbolPanel(false);' in line and i > 2450 and i < 2465:
        # Check if next line has className (missing closing braces)
        if i+1 < len(lines) and 'className=' in lines[i+1]:
            lines[i] = line.rstrip() + '\n'
            lines.insert(i+1, '                  }}\n')
            print(f"Inserted closing '}}}}' after L{i+1}")
            break

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.writelines(lines)

# Verify
with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    vlines = f.readlines()
for j in range(2455, min(2468, len(vlines))):
    print(f'L{j+1}: {vlines[j].rstrip()[:160]}')
print(f"Total lines: {len(vlines)}")
