with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 카드 렌더링 전체 영역 (L2468~2550)
print('=== Card rendering area L2468-2550 ===')
for i in range(2467, min(2555, len(lines))):
    line = lines[i].rstrip()[:220]
    print(f'L{i+1}: {line}')
