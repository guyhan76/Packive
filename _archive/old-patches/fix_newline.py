with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Fix: "stream\n" became actual newline in string literal
# Replace broken multi-line strings with escaped versions
src = src.replace('find("stream\n", ds)', r'find("stream\x0A", ds)')
src = src.replace('find("stream\r\n", ds)', r'find("stream\x0D\x0A", ds)')

# Also fix the marker lengths if needed
src = src.replace('dataStart = streamKeyRN + 8', 'dataStart = streamKeyRN + 10')  # "stream\r\n" = 8 chars
src = src.replace('dataStart = streamKey + 7', 'dataStart = streamKey + 7')  # "stream\n" = 7 chars

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)

# Verify
with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    v = f.read()
print(f'Has stream\\x0A: {"stream\\\\x0A" in v or "stream\\x0A" in v}')
print(f'Has broken newline: {"find(\\"stream" in v and v.count("find(\\"stream") > 0}')

lines = v.split('\n')
for i, line in enumerate(lines):
    if 'streamKey' in line and 'find' in line:
        print(f'L{i+1}: {line.rstrip()[:150]}')
