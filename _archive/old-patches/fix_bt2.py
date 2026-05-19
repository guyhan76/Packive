with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f'L4481: {repr(lines[4480][:150])}')

# Direct fix: replace the broken line
lines[4480] = lines[4480].replace('{  ext-[10px]', '{	ext-[10px]')

# Check if it needs closing backtick too - find the end of this className
# Look at surrounding lines for the closing
for i in range(4480, min(4495, len(lines))):
    print(f'L{i+1}: {repr(lines[i].rstrip()[:150])}')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Written')
