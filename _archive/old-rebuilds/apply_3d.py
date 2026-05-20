with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixes = 0

# Find the SVG preview comment line
for i in range(len(lines)):
    # Fix 1: Change comment
    if '{/* SVG preview */}' in lines[i]:
        lines[i] = lines[i].replace('{/* SVG preview */}', '{/* 3D + SVG preview */}')
        fixes += 1
        print(f'Fix1 L{i+1}: comment updated')

    # Fix 2: Before {t.svgPath, insert box3dPath block
    if '{t.svgPath ? (' in lines[i] and 'box3dPath' not in lines[i-1] and i > 0:
        indent = '                            '
        box3d = (
            indent + '{t.box3dPath ? (\n' +
            indent + '  <img src={t.box3dPath} alt={t.name} className="w-[92%] h-[92%] object-contain drop-shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = \'none\'; const next = (e.target as HTMLImageElement).nextElementSibling; if(next) (next as HTMLElement).style.display = \'flex\'; }} />\n' +
            indent + ') : null}\n'
        )
        lines.insert(i, box3d)
        fixes += 1
        print(f'Fix2 L{i+1}: box3dPath block inserted')
        break

# Re-scan after insert
for i in range(len(lines)):
    # Fix 3: Add style to hide svgPath when box3dPath exists
    if 'className="w-[90%] h-[90%] object-contain"' in lines[i] and 'style=' not in lines[i]:
        lines[i] = lines[i].replace(
            'className="w-[90%] h-[90%] object-contain"',
            'style={{"display": t.box3dPath ? "none" : undefined}} className="w-[90%] h-[90%] object-contain"'
        )
        fixes += 1
        print(f'Fix3 L{i+1}: svgPath hide style added')

    # Fix 4: Update iconSvg fallback
    if "t.svgPath ? 'hidden' : ''" in lines[i] and 'box3dPath' not in lines[i]:
        lines[i] = lines[i].replace(
            "t.svgPath ? 'hidden' : ''",
            "(t.svgPath || t.box3dPath) ? 'hidden' : ''"
        )
        fixes += 1
        print(f'Fix4 L{i+1}: iconSvg fallback updated')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

src = ''.join(lines)
print(f'\nTotal fixes: {fixes}')
print(f'box3dPath refs: {src.count("box3dPath")}')
