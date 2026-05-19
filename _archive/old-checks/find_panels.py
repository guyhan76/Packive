with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find leftTab panels
for i, line in enumerate(lines):
    if 'leftTab ===' in line and '{' in line:
        print(f'L{i+1}: {line.rstrip()[:120]}')
