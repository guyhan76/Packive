with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

lines = src.split('\n')

# 1. Find all keyboard event handlers
print('=== Keyboard Event Handlers ===')
for i, line in enumerate(lines):
    if any(kw in line for kw in ['keydown', 'keyup', 'KeyboardEvent', 'Ctrl+Z', 'Ctrl+Y', 'Ctrl+C', 'Ctrl+V', 'Ctrl+X', 'Ctrl+A', 'Ctrl+S']):
        print(f'L{i+1}: {line.rstrip()[:150]}')

print('\n=== useEffect with keyboard ===')
for i, line in enumerate(lines):
    if 'useEffect' in line:
        # Check next 5 lines for keyboard related code
        block = '\n'.join(lines[i:min(i+8, len(lines))])
        if any(kw in block for kw in ['keydown', 'keyboard', 'KeyboardEvent', 'ctrlKey', 'metaKey']):
            for j in range(i, min(i+15, len(lines))):
                print(f'L{j+1}: {lines[j].rstrip()[:150]}')
            print('---')

print('\n=== Copy/Paste/Cut functions ===')
for i, line in enumerate(lines):
    if any(kw in line for kw in ['copyObjects', 'pasteObjects', 'cutObjects', 'clipboard', 'selectAll']):
        print(f'L{i+1}: {line.rstrip()[:150]}')

print('\n=== addEventListener/removeEventListener ===')
for i, line in enumerate(lines):
    if 'addEventListener' in line or 'removeEventListener' in line:
        print(f'L{i+1}: {line.rstrip()[:150]}')
