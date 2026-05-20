with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# 정확한 문자열로 교체
old = ""
new = ""

count = src.count(old)
print(f'Found: {count}')
src = src.replace(old, new)

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)

check = '(t.svgPath || t.box3dPath)' in src
total = src.count('box3dPath')
print(f'Combined check exists: {check}')
print(f'Total box3dPath refs: {total}')
