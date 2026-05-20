with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'Ungroup' in line or 'Regroup' in line or 'dielineUngrouped' in line:
        print(f"L{i+1}: {line.rstrip()[:200]}")
