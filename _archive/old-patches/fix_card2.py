with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Fix 1: L2509 className 백틱 복원
old1 = 'className={w-[90%] h-[90%] object-contain }'
new1 = 'className="w-[90%] h-[90%] object-contain"'
count1 = src.count(old1)
src = src.replace(old1, new1)

# Fix 2: L2511 iconSvg div - box3dPath도 체크
old2 = "className={" + "" + "flex items-center justify-center w-full h-full " + "" + "}"
new2 = "className={" + "" + "flex items-center justify-center w-full h-full " + "" + "}"
count2 = src.count(old2)
src = src.replace(old2, new2)

# Fix 3: box3dPath가 있으면 svgPath img 숨기기
old3 = '''<img src={t.svgPath} alt={t.name} className="w-[90%] h-[90%] object-contain"'''
new3 = '''<img src={t.svgPath} alt={t.name} style={{display: t.box3dPath ? 'none' : undefined}} className="w-[90%] h-[90%] object-contain"'''
count3 = src.count(old3)
src = src.replace(old3, new3)

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)

print(f'Fix1 (className backtick): {count1} replaced')
print(f'Fix2 (iconSvg fallback): {count2} replaced')
print(f'Fix3 (svgPath hide): {count3} replaced')

# Verify
total = src.count('box3dPath')
print(f'Total box3dPath refs: {total}')
