import fitz

doc = fitz.open('fefco_code.pdf')
page = doc[17]
blocks = page.get_text('dict')['blocks']

print('=== Page 18 text blocks with positions ===')
for b in blocks:
    if 'lines' in b:
        for line in b['lines']:
            for span in line['spans']:
                txt = span['text'].strip()
                if txt and len(txt) < 30:
                    bbox = span['bbox']
                    print(f'  y={bbox[1]:.0f} x={bbox[0]:.0f} size={span["size"]:.1f} text="{txt}"')
