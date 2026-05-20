with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

old = "flex items-center justify-center w-full h-full "
new = "flex items-center justify-center w-full h-full "
count = src.count(old)
src = src.replace(old, new)

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)

print(f'Replaced: {count}')
total = src.count('box3dPath')
print(f'Total box3dPath refs: {total}')
