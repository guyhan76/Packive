with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find where dieline SVG is loaded onto canvas
print('=== Dieline SVG load / canvas add ===')
for i, line in enumerate(lines):
    stripped = line.lower()
    if any(kw in stripped for kw in ['loadsvg', 'dieline', '_isdieline', '_isdieline', '__dieline']):
        if any(kw2 in stripped for kw2 in ['canvas', 'add', 'load', 'svg', 'path']):
            print(f'L{i+1}: {lines[i].rstrip()[:180]}')

print('\n=== scaleRef ===')
for i, line in enumerate(lines):
    if 'scaleRef' in line and ('current' in line or 'useRef' in line):
        if i < 250:  # Only show definition area
            print(f'L{i+1}: {lines[i].rstrip()[:150]}')

print('\n=== Canvas width/height setup ===')
for i, line in enumerate(lines):
    if ('canvasW' in line or 'canvasH' in line) and ('const ' in line or '=' in line):
        if i < 900:
            print(f'L{i+1}: {lines[i].rstrip()[:150]}')
