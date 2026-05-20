with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the addBleedGuides call and add svgMmW parameter
old_call = 'const result = await addBleedGuides(cv, {\n                        scale: scaleRef.current,'
new_call = 'const result = await addBleedGuides(cv, {\n                        scale: scaleRef.current,\n                        svgMmW: svgMmWRef.current,'

if old_call in content:
    content = content.replace(old_call, new_call)
    print("Added svgMmW to addBleedGuides call")
else:
    # Try with different whitespace
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'scale: scaleRef.current,' in line and i > 0 and 'addBleedGuides' in lines[i-1]:
            lines.insert(i+1, lines[i].replace('scale: scaleRef.current,', 'svgMmW: svgMmWRef.current,'))
            print(f"Inserted svgMmW at line {i+2}")
            break
    content = '\n'.join(lines)

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Editor updated")

# Now update bleed-guide.ts to use svgMmW properly
with open('src/lib/bleed-guide.ts', 'r', encoding='utf-8') as f:
    bleed = f.read()

# Replace the pxPerMm calculation to use svgMmW first
old_calc = '  const svgMm = g.width * 0.264583;'
new_calc = '  const svgMm = config.svgMmW || g.width * 0.264583;'

if old_calc in bleed:
    bleed = bleed.replace(old_calc, new_calc)
    print("Updated pxPerMm to use config.svgMmW")
else:
    print("WARNING: pxPerMm calc not found, searching...")
    if 'svgMm' in bleed:
        print("svgMm found in bleed-guide.ts")
    else:
        print("svgMm NOT found")

with open('src/lib/bleed-guide.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(bleed)
print("Bleed guide updated")
