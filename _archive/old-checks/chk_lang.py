with open('src/lib/dieline-templates.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find where name/description fields are defined - check if Korean is used as default
for i, line in enumerate(lines):
    if any(k in line for k in ['name:', 'description:', 'descriptionKo']):
        if i > 150 and i < 400:
            print(f"L{i+1}: {line.rstrip()[:200]}")
