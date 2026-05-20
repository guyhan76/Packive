with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Find layers panel code
lines = src.split('\n')
for i, line in enumerate(lines):
    if 'layersList' in line and ('map' in line or 'render' in line or 'className' in line):
        for j in range(max(0, i-2), min(len(lines), i+20)):
            print(f'L{j+1}: {lines[j].rstrip()[:180]}')
        print('---')
        break

# Also find refreshLayers function
for i, line in enumerate(lines):
    if 'refreshLayers' in line and ('const' in line or 'function' in line) and '=>' in line:
        for j in range(i, min(len(lines), i+30)):
            print(f'L{j+1}: {lines[j].rstrip()[:180]}')
        print('---')
        break
