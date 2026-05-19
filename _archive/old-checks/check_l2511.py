with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# L2511 정확한 내용 확인
line = lines[2510]
print(f'L2511 length: {len(line)}')
print(f'L2511 repr: {repr(line[:300])}')
