fpath = 'node_modules/js-clipper/clipper.js'
with open(fpath, 'rb') as f:
    raw = f.read()

print(f'Size: {len(raw)} bytes')
print(f'Bad byte at 165105: 0x{raw[165105]:02x}')
print(f'Context: {raw[165100:165115]}')

# Decode with replacement to fix bad bytes
text = raw.decode('utf-8', errors='replace')
bad_count = text.count('\ufffd')
print(f'Replacement chars: {bad_count}')

# Write back as clean UTF-8
with open(fpath, 'w', encoding='utf-8', newline='\n') as f:
    f.write(text)
print('Fixed js-clipper/clipper.js')
