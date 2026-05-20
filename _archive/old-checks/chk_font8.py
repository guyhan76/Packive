with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find updateProp function definition
for i, line in enumerate(lines):
    if 'updateProp' in line and ('const updateProp' in line or 'function updateProp' in line or 'useCallback' in line):
        for j in range(i, min(i+20, len(lines))):
            print(f'L{j+1}: {lines[j].rstrip()[:160]}')
        print()
        break
