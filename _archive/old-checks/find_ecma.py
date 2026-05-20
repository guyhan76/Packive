import fitz

doc = fitz.open('ecma_code.pdf')
print(f'Total pages: {len(doc)}')

# ECMA 코드 검색 (우리가 필요한 7개)
targets = ['A20.20.03.03','A20.20.03.01','A10.10.03.03',
           'A55.20.01.03','A55.21.01.03','B10.20.05.01','B20.20.01.05']

# 짧은 형태도 검색
short_targets = ['A20.20.03','A10.10.03','A55.20.01','A55.21.01','B10.20.05','B20.20.01']

found = {}
for i in range(len(doc)):
    page = doc[i]
    text = page.get_text()
    for t in targets:
        if t not in found and t in text:
            imgs = page.get_images()
            found[t] = {'page': i+1, 'imgs': len(imgs)}
    for t in short_targets:
        if t not in found and t in text:
            imgs = page.get_images()
            found[t] = {'page': i+1, 'imgs': len(imgs)}

print('\n=== Found ECMA pages ===')
for t in targets + short_targets:
    if t in found:
        print(f'  {t}: page {found[t]["page"]}, images: {found[t]["imgs"]}')

# 처음 20페이지 텍스트 미리보기
print('\n=== First 20 pages ===')
for i in range(min(20, len(doc))):
    page = doc[i]
    text = page.get_text().strip().replace(chr(10), ' ')[:100]
    imgs = page.get_images()
    print(f'P{i+1}: imgs={len(imgs)} text={text}')
