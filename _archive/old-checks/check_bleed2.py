with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show bleed button area (L2995 ~ L3015)
for i in range(2995, min(3015, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:180]}')

print('\n=== Preflight button area ===')
for i in range(3005, min(3020, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:180]}')

# Find where dieline is generated and rendered on canvas
print('\n=== Dieline generation / canvas rendering ===')
for i, line in enumerate(lines):
    if 'generateDieline' in line and ('await' in line or 'const' in line):
        print(f'L{i+1}: {line.rstrip()[:180]}')
    if 'addBleedGuides' in line:
        print(f'L{i+1}: {line.rstrip()[:180]}')
