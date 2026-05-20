with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    s = line.rstrip()
    if 'fcRef' in s and ('current' in s) and ('=' in s) and i < 300:
        print(f"L{i+1}: {s[:250]}")
