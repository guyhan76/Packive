with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print the exact click handler
for i, line in enumerate(lines):
    if i > 2430 and i < 2460:
        print(f'L{i+1}: {line.rstrip()[:200]}')
