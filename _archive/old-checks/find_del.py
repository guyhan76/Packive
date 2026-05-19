with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

lines = src.split('\n')
changes = 0

# Find and show lines with Delete button and Picker button in left panel
for i, line in enumerate(lines):
    if ('Delete' in line or 'Picker' in line or 'delete' in line.lower()) and ('button' in line.lower() or 'icon' in line.lower() or 'label' in line.lower()):
        if i > 2100 and i < 2300:
            print(f'L{i+1}: {line.rstrip()[:160]}')

print()
# Find eyedropper section
for i, line in enumerate(lines):
    if 'eyedropper' in line.lower() and i > 2100 and i < 2300:
        print(f'L{i+1}: {line.rstrip()[:160]}')
