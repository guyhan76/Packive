import json, os

# Read each SVG file content
folder = 'public/symbols'
symbols = [
    {"file": "1_glass.svg", "id": "glass", "name": "Fragile", "nameKo": "깨짐 주의", "category": "handling"},
    {"file": "2_umbreller1.svg", "id": "umbrella", "name": "Keep Dry", "nameKo": "물기 주의", "category": "handling"},
    {"file": "3_nife6.svg", "id": "no-knife", "name": "No Knife", "nameKo": "칼 사용 금지", "category": "handling"},
    {"file": "4_nife1.svg", "id": "no-cutter", "name": "No Cutter", "nameKo": "커터 사용 금지", "category": "handling"},
    {"file": "5_hand.svg", "id": "handle-care", "name": "Handle with Care", "nameKo": "취급 주의", "category": "handling"},
    {"file": "6_fire1.svg", "id": "flammable", "name": "Flammable", "nameKo": "인화성", "category": "hazard"},
    {"file": "7_shoes2.svg", "id": "footwear", "name": "Use Trolley", "nameKo": "운반차 사용", "category": "handling"},
    {"file": "8_sun.svg", "id": "sun", "name": "Keep from Sun", "nameKo": "직사광선 주의", "category": "handling"},
    {"file": "9_stack.svg", "id": "stack", "name": "Stacking Limit", "nameKo": "적재 제한", "category": "handling"},
    {"file": "10_recycle1.svg", "id": "recycle", "name": "Recyclable", "nameKo": "재활용", "category": "recycling"},
]

out = []
out.append('export interface PackagingSymbol {')
out.append('  id: string;')
out.append('  name: string;')
out.append('  nameKo: string;')
out.append('  category: string;')
out.append('  svg: string;')
out.append('}')
out.append('')
out.append('export const PACKAGING_SYMBOLS: PackagingSymbol[] = [')

for s in symbols:
    path = os.path.join(folder, s["file"])
    with open(path, 'r', encoding='utf-8') as f:
        svg = f.read()
    # Remove XML declaration
    svg = svg.replace('<?xml version="1.0" encoding="UTF-8"?>\n', '')
    svg = svg.replace('<?xml version="1.0" encoding="UTF-8"?>', '')
    svg_json = json.dumps(svg)
    out.append('  { id: %s, name: %s, nameKo: %s, category: %s, svg: %s },' % (
        json.dumps(s["id"]), json.dumps(s["name"]), json.dumps(s["nameKo"]),
        json.dumps(s["category"]), svg_json))

out.append('];')
out.append('')
out.append('export const SYMBOL_CATEGORIES = [')
out.append('  { id: "all", name: "All", nameKo: "전체" },')
out.append('  { id: "handling", name: "Handling", nameKo: "취급" },')
out.append('  { id: "hazard", name: "Hazard", nameKo: "위험물" },')
out.append('  { id: "recycling", name: "Recycling", nameKo: "재활용" },')
out.append('];')
out.append('')

content = '\n'.join(out)
with open('src/lib/packaging-symbols.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Created packaging-symbols.ts: %d lines' % len(out))
