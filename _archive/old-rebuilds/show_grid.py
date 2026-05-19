with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the IIFE that renders the template grid
for i in range(len(lines)):
    if 'getTemplatesByCategory' in lines[i]:
        for j in range(max(0, i-2), min(len(lines), i+80)):
            print(f'L{j+1}: {lines[j].rstrip()[:150]}')
        print('---END---')
        break
