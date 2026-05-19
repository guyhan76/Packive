# Read the exported PDF and find image XObject headers
import glob, os

# Find most recent PDF
pdfs = glob.glob(os.path.expanduser('~/Downloads/packive-design*.pdf'))
pdfs += glob.glob(os.path.expanduser('~/Desktop/packive-design*.pdf'))
pdfs += glob.glob('packive-design*.pdf')

if not pdfs:
    print('No PDF found. Checking Downloads...')
    dl = os.path.expanduser('~/Downloads')
    for f in sorted(os.listdir(dl), key=lambda x: os.path.getmtime(os.path.join(dl,x)), reverse=True)[:10]:
        if f.endswith('.pdf'):
            print(f'  {f}')
            pdfs.append(os.path.join(dl, f))
            break

if pdfs:
    pdf_path = max(pdfs, key=os.path.getmtime)
    print(f'Reading: {pdf_path}')
    with open(pdf_path, 'rb') as f:
        raw = f.read()
    
    text = raw.decode('latin-1')
    
    # Find /Subtype /Image patterns
    import re
    for m in re.finditer(r'/Subtype\s*/Image', text):
        start = max(0, m.start() - 200)
        end = min(len(text), m.start() + 300)
        block = text[start:end]
        # Clean for display
        block = block.replace('\r', '\\r').replace('\n', '\\n')
        print(f'\n=== Image XObject at pos {m.start()} ===')
        print(block[:400])
else:
    print('No PDF files found')
