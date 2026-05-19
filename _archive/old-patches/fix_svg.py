import os, json, re

folder = 'public/symbols'
files = sorted([f for f in os.listdir(folder) if f.endswith('.svg')])

# Step 1: Clean SVG files - remove duplicate IDs, make unique
for i, f in enumerate(files):
    path = os.path.join(folder, f)
    with open(path, 'r', encoding='utf-8') as fh:
        svg = fh.read()
    
    # Remove XML declaration
    svg = svg.replace('<?xml version="1.0" encoding="UTF-8"?>\n', '')
    svg = svg.replace('<?xml version="1.0" encoding="UTF-8"?>', '')
    
    # Make IDs unique per file
    base = f.replace('.svg','')
    svg = re.sub(r'id="([^"]*)"', lambda m: f'id="{base}_{m.group(1)}"', svg)
    svg = re.sub(r'data-name="[^"]*"', '', svg)
    
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(svg)
    print(f'Cleaned: {f}')

# Step 2: Update packaging-symbols.ts to use file paths instead of inline SVG
# Also update the editor to use fabric.Image.fromURL with /symbols/xxx.svg

# Regenerate packaging-symbols.ts with svg content
symbols = [
    {"file": "1_glass.svg", "id": "glass", "name": "Fragile", "nameKo": "Fragile", "category": "handling"},
    {"file": "2_umbreller1.svg", "id": "umbrella", "name": "Keep Dry", "nameKo": "Keep Dry", "category": "handling"},
    {"file": "3_nife6.svg", "id": "no-knife", "name": "No Knife", "nameKo": "No Knife", "category": "handling"},
    {"file": "4_nife1.svg", "id": "no-cutter", "name": "No Cutter", "nameKo": "No Cutter", "category": "handling"},
    {"file": "5_hand.svg", "id": "handle-care", "name": "Handle with Care", "nameKo": "Handle with Care", "category": "handling"},
    {"file": "6_fire1.svg", "id": "flammable", "name": "Flammable", "nameKo": "Flammable", "category": "hazard"},
    {"file": "7_shoes2.svg", "id": "trolley", "name": "Use Trolley", "nameKo": "Use Trolley", "category": "handling"},
    {"file": "8_sun.svg", "id": "sun", "name": "Keep from Sun", "nameKo": "Keep from Sun", "category": "handling"},
    {"file": "9_stack.svg", "id": "stack", "name": "Stacking Limit", "nameKo": "Stacking Limit", "category": "handling"},
    {"file": "10_recycle1.svg", "id": "recycle", "name": "Recyclable", "nameKo": "Recyclable", "category": "recycling"},
]

# Check for new file 11_recycle2.svg
if '11_recycle2.svg' in files:
    symbols.append({"file": "11_recycle2.svg", "id": "recycle2", "name": "Recycle Symbol", "nameKo": "Recycle Symbol", "category": "recycling"})

out = []
out.append('export interface PackagingSymbol {')
out.append('  id: string;')
out.append('  name: string;')
out.append('  nameKo: string;')
out.append('  category: string;')
out.append('  svg: string;')
out.append('  path: string;')
out.append('}')
out.append('')
out.append('export const PACKAGING_SYMBOLS: PackagingSymbol[] = [')

for s in symbols:
    path = os.path.join(folder, s["file"])
    with open(path, 'r', encoding='utf-8') as fh:
        svg = fh.read()
    svg_json = json.dumps(svg)
    file_path = json.dumps('/symbols/' + s["file"])
    out.append('  { id: %s, name: %s, nameKo: %s, category: %s, svg: %s, path: %s },' % (
        json.dumps(s["id"]), json.dumps(s["name"]), json.dumps(s["nameKo"]),
        json.dumps(s["category"]), svg_json, file_path))

out.append('];')
out.append('')
out.append('export const SYMBOL_CATEGORIES = [')
out.append('  { id: "all", name: "All", nameKo: "All" },')
out.append('  { id: "handling", name: "Handling", nameKo: "Handling" },')
out.append('  { id: "hazard", name: "Hazard", nameKo: "Hazard" },')
out.append('  { id: "recycling", name: "Recycling", nameKo: "Recycling" },')
out.append('];')
out.append('')

content = '\n'.join(out)
with open('src/lib/packaging-symbols.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Created packaging-symbols.ts: {len(out)} lines, {len(symbols)} symbols')
