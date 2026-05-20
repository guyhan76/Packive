with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixes = 0

# Fix L2517 (index 2516): title missing backticks and t.code
line = lines[2516]
if 'title={' in line:
    lines[2516] = line.replace(
        'title={ - }',
        'title={${t.name} - }'
    )
    fixes += 1
    print(f"Fix1 L2517: {repr(lines[2516].rstrip()[:100])}")

# Fix L2524 (index 2523): popularity dots missing backticks
line = lines[2523]
if 'className={w-[4px]' in line:
    lines[2523] = line.replace(
        'className={w-[4px] h-[4px] rounded-full }',
        'className={w-[4px] h-[4px] rounded-full }'
    )
    fixes += 1
    print(f"Fix2 L2524: {repr(lines[2523].rstrip()[:100])}")

# Fix L2535 (index 2534): iconSvg missing backticks
line = lines[2534]
if 'className={flex items-center' in line:
    lines[2534] = line.replace(
        'className={flex items-center justify-center w-full h-full }',
        'className={lex items-center justify-center w-full h-full }'
    )
    fixes += 1
    print(f"Fix3 L2535: {repr(lines[2534].rstrip()[:100])}")

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"\nTotal fixes: {fixes}")

# Verify
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Check no remaining broken classNames in card area
import re
card_start = src.find('const renderCard')
card_end = src.find('const renderGroup')
card_section = src[card_start:card_end]

broken = re.findall(r'className=\{(?!)([^}]+)\}', card_section)
if broken:
    for b in broken:
        if ' ' in b and '{{' not in b:
            print(f"WARNING remaining broken className: {repr(b[:80])}")
else:
    print("All classNames OK")
