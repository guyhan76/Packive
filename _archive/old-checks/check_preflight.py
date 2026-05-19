with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

lines = src.split('\n')

print('=== Preflight 관련 코드 ===')
for i, line in enumerate(lines):
    if 'preflight' in line.lower() and ('import' in line.lower() or 'run' in line.lower() or 'show' in line.lower() or 'result' in line.lower() or 'button' in line.lower()):
        print(f'L{i+1}: {line.rstrip()[:150]}')

print('\n=== Bleed 관련 코드 ===')
for i, line in enumerate(lines):
    if 'bleed' in line.lower() and ('import' in line.lower() or 'add' in line.lower() or 'toggle' in line.lower() or 'guide' in line.lower() or 'mm' in line.lower()):
        print(f'L{i+1}: {line.rstrip()[:150]}')

print('\n=== Preflight lib ===')
import os
preflight_path = 'src/lib/preflight.ts'
if os.path.exists(preflight_path):
    with open(preflight_path, 'r', encoding='utf-8') as f:
        pf = f.read()
    print(f'File exists: {len(pf)} chars, {len(pf.splitlines())} lines')
    # Show exported functions
    for i, line in enumerate(pf.split('\n')):
        if 'export' in line and ('function' in line or 'interface' in line or 'type' in line):
            print(f'  L{i+1}: {line.rstrip()[:120]}')
else:
    print('preflight.ts NOT FOUND')

print('\n=== Bleed lib ===')
bleed_path = 'src/lib/bleed-guide.ts'
if os.path.exists(bleed_path):
    with open(bleed_path, 'r', encoding='utf-8') as f:
        bg = f.read()
    print(f'File exists: {len(bg)} chars, {len(bg.splitlines())} lines')
    for i, line in enumerate(bg.split('\n')):
        if 'export' in line and ('function' in line or 'interface' in line or 'const' in line):
            print(f'  L{i+1}: {line.rstrip()[:120]}')
else:
    print('bleed-guide.ts NOT FOUND')
