with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'Symbols' in line and 'action' in line:
        # Show context
        for j in range(max(0,i-5), min(i+3, len(lines))):
            print(f'L{j+1}: {lines[j].rstrip()[:180]}')
        break
