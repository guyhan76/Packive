import os, re, json

svg_dir = "public/symbols"

# ============================================
# Step 1: Fix all SVG files - unique class names, no digit-start
# ============================================
for fname in sorted(os.listdir(svg_dir)):
    if not fname.endswith(".svg"):
        continue
    fpath = os.path.join(svg_dir, fname)
    prefix = "s" + re.sub(r'[^a-zA-Z0-9]', '_', fname.replace(".svg",""))
    
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = re.sub(r'<\?xml[^?]*\?>\s*', '', content)
    
    old = content
    classes = set(re.findall(r'\bcls-(\d+)\b', content))
    for cls_num in classes:
        content = content.replace(f"cls-{cls_num}", f"{prefix}_c{cls_num}")
    
    content = re.sub(r'(?<=id=")(\d)', r's\1', content)
    content = re.sub(r'(?<=\.)(\d+_)', lambda m: 's'+m.group(1), content)
    content = re.sub(r'(?<=class=")(\d+_)', lambda m: 's'+m.group(1), content)
    
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    
    changed = "FIXED" if content != old else "ok"
    print(f"{changed}: {fname}")

# ============================================
# Step 2: Generate packaging-symbols.ts (English only)
# ============================================
symbols_meta = [
    ("1_glass.svg", "glass", "Fragile", "handling"),
    ("2_umbreller1.svg", "umbrella", "Keep Dry", "handling"),
    ("3_nife6.svg", "no-knife", "No Knife", "handling"),
    ("4_nife1.svg", "no-cutter", "No Cutter", "handling"),
    ("5_hand.svg", "handle-care", "Handle with Care", "handling"),
    ("7_shoes2.svg", "no-step", "Do Not Step", "handling"),
    ("8_sun.svg", "keep-from-sun", "Keep from Sun", "handling"),
    ("9_up.svg", "this-side-up", "This Side Up", "handling"),
    ("10_PREEZE.svg", "keep-frozen", "Keep Frozen", "handling"),
    ("14_1_temp2.svg", "temp-limit-2", "Temperature Limit", "handling"),
    ("14_temp1.svg", "temp-limit-1", "Temperature Range", "handling"),
    ("15_do not drop.svg", "no-drop", "Do Not Drop", "handling"),
    ("15_gori.svg", "hook-here", "Hook Here", "handling"),
    ("16_Lift pork x.svg", "no-forklift", "No Forklift", "handling"),
    ("17_stack_truck x.svg", "no-hand-truck", "No Hand Truck", "handling"),
    ("18_stack.svg", "stacking-limit", "Stacking Limit", "handling"),
    ("19_stack.svg", "do-not-stack", "Do Not Stack", "handling"),
    ("31_stack4.svg", "stack-4", "Stack Limit 4", "handling"),
    ("32_stack6.svg", "stack-6", "Stack Limit 6", "handling"),
    ("33_stack8.svg", "stack-8", "Stack Limit 8", "handling"),
    ("6_fire1.svg", "flammable", "Flammable", "hazard"),
    ("11_nuclear.svg", "radioactive", "Radioactive", "hazard"),
    ("12_magnet.svg", "magnetic", "Magnetic Field", "hazard"),
    ("13_caution.svg", "caution", "Caution", "hazard"),
    ("37esd_safe.svg", "esd", "ESD Sensitive", "hazard"),
    ("20_recycle1.svg", "recycle-1", "Recyclable", "recycling"),
    ("21_recycle2.svg", "recycle-2", "Recycle Arrows", "recycling"),
    ("22_recycle3.svg", "recycle-3", "Recycle Circle", "recycling"),
    ("23_recycle4.svg", "recycle-4", "Recycle Triangle", "recycling"),
    ("24_HDPE2.svg", "hdpe", "HDPE 2", "recycling"),
    ("25_PET1.svg", "pet", "PET 1", "recycling"),
    ("26_PVC3.svg", "pvc", "PVC 3", "recycling"),
    ("27_LDPE4.svg", "ldpe", "LDPE 4", "recycling"),
    ("28_PP5.svg", "pp", "PP 5", "recycling"),
    ("29_PS6.svg", "ps", "PS 6", "recycling"),
    ("30_OTHER7.svg", "other", "OTHER 7", "recycling"),
    ("34_ce.svg", "ce-mark", "CE Mark", "certification"),
    ("35_FSC.svg", "fsc", "FSC Certified", "certification"),
    ("36_food_safe.svg", "food-safe", "Food Safe", "certification"),
    ("38_kite_mark.svg", "kite-mark", "Kite Mark", "certification"),
]

ts_lines = []
ts_lines.append('export interface PackagingSymbol {')
ts_lines.append('  id: string;')
ts_lines.append('  name: string;')
ts_lines.append('  category: string;')
ts_lines.append('  svg: string;')
ts_lines.append('  path: string;')
ts_lines.append('}')
ts_lines.append('')
ts_lines.append('export const PACKAGING_SYMBOLS: PackagingSymbol[] = [')

count = 0
for fname, sid, name, cat in symbols_meta:
    fpath = os.path.join(svg_dir, fname)
    if not os.path.exists(fpath):
        print(f"SKIP: {fname} not found")
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        svg = f.read().strip()
    ts_lines.append(f'  {{ id: {json.dumps(sid)}, name: {json.dumps(name)}, category: {json.dumps(cat)}, svg: {json.dumps(svg)}, path: "/symbols/{fname}" }},')
    count += 1

ts_lines.append('];')
ts_lines.append('')
ts_lines.append('export const SYMBOL_CATEGORIES = [')
ts_lines.append('  { id: "all", name: "All" },')
ts_lines.append('  { id: "handling", name: "Handling" },')
ts_lines.append('  { id: "hazard", name: "Hazard" },')
ts_lines.append('  { id: "recycling", name: "Recycling" },')
ts_lines.append('  { id: "certification", name: "Certification" },')
ts_lines.append('];')

with open("src/lib/packaging-symbols.ts", "w", encoding="utf-8") as f:
    f.write('\n'.join(ts_lines) + '\n')
print(f"\nGenerated packaging-symbols.ts: {count} symbols, {len(ts_lines)} lines")
