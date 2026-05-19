with open('src/lib/dieline-templates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find iconSvg references
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'iconSvg' in line:
        print(f"L{i+1}: {line.rstrip()[:200]}")
