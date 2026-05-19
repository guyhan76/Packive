with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# box3dPath 관련 라인 모두 출력
for i, line in enumerate(lines):
    if 'box3dPath' in line:
        print(f'L{i+1}: {line.rstrip()[:200]}')

# L2503-2515 확인
print('\n=== Preview area ===')
for i in range(2502, min(2518, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:220]}')
