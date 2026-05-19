with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

changes = 0

# Fix 1: Add "calli" to fontCategory type
old_type = 'useState<"all"|"en"|"ko"|"ja">("all")'
new_type = 'useState<"all"|"en"|"ko"|"ja"|"calli">("all")'
if old_type in src:
    src = src.replace(old_type, new_type)
    changes += 1
    print('Fix1: Added calli to fontCategory type')

# Fix 2: Find the font category tabs and add Calli tab
# Find the tab rendering area
lines = src.split('\n')
for i, line in enumerate(lines):
    if 'fontCategory===cat' in line or 'fontCategory === cat' in line:
        # Find the array of categories above this line
        for j in range(i-5, i):
            if '["all","en","ko","ja"]' in lines[j] or '["All","English","Korean","Japanese"]' in lines[j]:
                print(f'L{j+1}: {lines[j].rstrip()[:160]}')

# Find the category tabs map
for i, line in enumerate(lines):
    if '"ja"' in line and '"ko"' in line and '"en"' in line and '"all"' in line and 'map' in line:
        print(f'Tab map L{i+1}: {line.rstrip()[:160]}')
    if '"Japanese"' in line and '"Korean"' in line:
        print(f'Labels L{i+1}: {line.rstrip()[:160]}')

# Show lines around L3650-3670 for tab rendering
for i in range(3648, min(3660, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:160]}')

