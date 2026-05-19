with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

changes = 0

for i in range(len(lines)):
    # 1. SVG preview -> 3D + SVG preview 주석
    if '{/* SVG preview */}' in lines[i]:
        lines[i] = lines[i].replace('{/* SVG preview */}', '{/* 3D + SVG preview */}')
        changes += 1

    # 2. t.svgPath 앞에 box3dPath 이미지 삽입 (첫번째 t.svgPath ? ( 만)
    if '{t.svgPath ? (' in lines[i] and 'box3dPath' not in lines[i] and changes < 3:
        indent = '                            '
        insert = indent + '{t.box3dPath ? (\n'
        insert += indent + '  <img src={t.box3dPath} alt={t.name} className="w-[92%] h-[92%] object-contain drop-shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = \'none\'; const next = (e.target as HTMLImageElement).nextElementSibling; if(next) (next as HTMLElement).style.display = \'flex\'; }} />\n'
        insert += indent + ') : null}\n'
        lines[i] = insert + lines[i]
        changes += 1

    # 3. svgPath img에 box3dPath 있으면 숨기기
    if '<img src={t.svgPath}' in lines[i] and 'box3dPath' not in lines[i]:
        lines[i] = lines[i].replace(
            '<img src={t.svgPath} alt={t.name} className="w-[90%] h-[90%] object-contain"',
            '<img src={t.svgPath} alt={t.name} style={{"display": t.box3dPath ? "none" : undefined}} className="w-[90%] h-[90%] object-contain"'
        )
        changes += 1

    # 4. iconSvg div에 box3dPath 체크 추가
    if "t.svgPath ? 'hidden' : ''" in lines[i] and 'box3dPath' not in lines[i]:
        lines[i] = lines[i].replace(
            "t.svgPath ? 'hidden' : ''",
            "(t.svgPath || t.box3dPath) ? 'hidden' : ''"
        )
        changes += 1

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f'Total changes: {changes}')

# Verify
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()
print(f'box3dPath refs: {src.count("box3dPath")}')
print(f'3D comment: {"3D + SVG preview" in src}')
print(f'drop-shadow: {"drop-shadow-sm" in src}')
print(f'combined check: {"(t.svgPath || t.box3dPath)" in src}')
