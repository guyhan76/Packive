with open('src/components/editor/unified-editor.tsx','rb') as f:
    raw = f.read()

# 1. Remove BOM
if raw.startswith(b'\xef\xbb\xbf'):
    raw = raw[3:]
    print('BOM removed')

text = raw.decode('utf-8')

# 2. Normalize line endings to LF only
text = text.replace('\r\n', '\n').replace('\r', '\n')
print('Line endings normalized to LF')

# 3. Remove duplicate __pc line
lines = text.split('\n')
new_lines = []
pc_count = 0
for line in lines:
    if 'keep ref fresh after dieline load' in line:
        pc_count += 1
        if pc_count > 1:
            print('Removed duplicate __pc line')
            continue
    new_lines.append(line)

text = '\n'.join(new_lines)
print('Total lines:', len(new_lines))

with open('src/components/editor/unified-editor.tsx','w', encoding='utf-8', newline='\n') as f:
    f.write(text)

# Verify
with open('src/components/editor/unified-editor.tsx','rb') as f:
    check = f.read()
print('Final size:', len(check), 'bytes')
print('Has BOM:', check[:3] == b'\xef\xbb\xbf')
cr = check.count(b'\r')
print('CR bytes:', cr)
