import re

with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# 1. SVG preview -> 3D + SVG preview
old1 = '{/* SVG preview */}'
new1 = '{/* 3D + SVG preview */}'
src = src.replace(old1, new1, 1)

# 2. box3dPath 이미지를 svgPath 이미지 앞에 삽입
old2 = """{t.svgPath ? (
                              <img src={t.svgPath}"""

new2 = """{t.box3dPath ? (
                              <img src={t.box3dPath} alt={t.name} className="w-[92%] h-[92%] object-contain drop-shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; const next = (e.target as HTMLImageElement).nextElementSibling; if(next) (next as HTMLElement).style.display = 'flex'; }} />
                            ) : null}
                            {t.svgPath ? (
                              <img src={t.svgPath}"""

src = src.replace(old2, new2, 1)

# 3. SVG img에 box3dPath가 있으면 기본 숨김 추가
old3 = "className={lex items-center justify-center w-full h-full }"
new3 = "className={lex items-center justify-center w-full h-full }"
src = src.replace(old3, new3, 1)

# 4. svgPath img에도 box3dPath가 있으면 숨김
old4 = '<img src={t.svgPath} alt={t.name} className="w-[90%] h-[90%] object-contain"'
new4 = '<img src={t.svgPath} alt={t.name} className={w-[90%] h-[90%] object-contain }'
src = src.replace(old4, new4, 1)

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)

# Verify
count = src.count('box3dPath')
has_drop = 'drop-shadow-sm' in src
print(f'box3dPath refs: {count}')
print(f'drop-shadow: {has_drop}')
print(f'3D + SVG comment: {"3D + SVG preview" in src}')
