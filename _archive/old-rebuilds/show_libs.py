# Preflight 전체 코드
print('=== src/lib/preflight.ts ===')
with open('src/lib/preflight.ts', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f.readlines()):
        print(f'L{i+1}: {line.rstrip()[:160]}')

print('\n\n=== src/lib/bleed-guide.ts ===')
with open('src/lib/bleed-guide.ts', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f.readlines()):
        print(f'L{i+1}: {line.rstrip()[:160]}')
