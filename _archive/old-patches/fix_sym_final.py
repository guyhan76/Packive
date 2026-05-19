import os, re, json

# ============================================
# Step 1: Fix SVG files - make class names unique per file
# ============================================
svg_dir = "public/symbols"
for fname in sorted(os.listdir(svg_dir)):
    if not fname.endswith(".svg"):
        continue
    fpath = os.path.join(svg_dir, fname)
    prefix = fname.replace(".svg","").replace("-","_")
    
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Find all class names like cls-1, cls-2
    classes = set(re.findall(r'\bcls-(\d+)\b', content))
    for cls_num in classes:
        old_cls = f"cls-{cls_num}"
        new_cls = f"{prefix}_c{cls_num}"
        content = content.replace(old_cls, new_cls)
    
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Fixed classes in {fname}: {len(classes)} classes renamed")

# ============================================
# Step 2: Regenerate packaging-symbols.ts with clean SVGs
# ============================================
symbols_meta = [
    ("1_glass.svg", "glass", "Fragile", "깨짐 주의", "handling"),
    ("2_umbreller1.svg", "umbrella", "Keep Dry", "물기 금지", "handling"),
    ("3_nife6.svg", "no-knife", "No Knife", "칼 사용 금지", "handling"),
    ("4_nife1.svg", "no-cutter", "No Cutter", "커터 금지", "handling"),
    ("5_hand.svg", "handle-care", "Handle with Care", "취급 주의", "handling"),
    ("6_fire1.svg", "flammable", "Flammable", "화기 주의", "hazard"),
    ("7_shoes2.svg", "trolley", "Use Trolley", "운반차 사용", "handling"),
    ("8_sun.svg", "sun", "Keep from Sun", "직사광선 주의", "handling"),
    ("9_stack.svg", "stack", "Stacking Limit", "적재 제한", "handling"),
    ("10_recycle1.svg", "recycle", "Recyclable", "재활용", "recycling"),
    ("11_recycle2.svg", "recycle2", "Recycle Symbol", "재활용 마크", "recycling"),
]

ts_lines = []
ts_lines.append('export interface PackagingSymbol {')
ts_lines.append('  id: string;')
ts_lines.append('  name: string;')
ts_lines.append('  nameKo: string;')
ts_lines.append('  category: string;')
ts_lines.append('  svg: string;')
ts_lines.append('  path: string;')
ts_lines.append('}')
ts_lines.append('')
ts_lines.append('export const PACKAGING_SYMBOLS: PackagingSymbol[] = [')

for fname, sid, name, nameKo, cat in symbols_meta:
    fpath = os.path.join(svg_dir, fname)
    if not os.path.exists(fpath):
        print(f"SKIP {fname} - not found")
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        svg = f.read().strip()
    svg_json = json.dumps(svg)
    ts_lines.append(f'  {{ id: {json.dumps(sid)}, name: {json.dumps(name)}, nameKo: {json.dumps(nameKo)}, category: {json.dumps(cat)}, svg: {svg_json}, path: "/symbols/{fname}" }},')

ts_lines.append('];')
ts_lines.append('')
ts_lines.append('export const SYMBOL_CATEGORIES = [')
ts_lines.append('  { id: "all", name: "All", nameKo: "전체" },')
ts_lines.append('  { id: "handling", name: "Handling", nameKo: "취급" },')
ts_lines.append('  { id: "hazard", name: "Hazard", nameKo: "위험" },')
ts_lines.append('  { id: "recycling", name: "Recycling", nameKo: "재활용" },')
ts_lines.append('];')

with open("src/lib/packaging-symbols.ts", "w", encoding="utf-8") as f:
    f.write('\n'.join(ts_lines) + '\n')
print(f"\nGenerated packaging-symbols.ts: {len(ts_lines)} lines")

# ============================================
# Step 3: Fix the click handler - use Image.fromURL for reliability
# ============================================
with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

old_handler = """F.loadSVGFromURL(sym.path, (objects: any[], options: any) => {
                      if (!objects || objects.length === 0) return;
                      const group = objects.length === 1 ? objects[0] : F.util.groupSVGElements(objects, options);
                      group.set({ left: 100, top: 100 });
                      group.scaleToWidth(80);
                      c.add(group);
                      c.setActiveObject(group);
                      c.requestRenderAll();
                      refreshLayers();
                    });"""

new_handler = """fetch(sym.path).then(r => r.text()).then(svgText => {
                      const parser = new DOMParser();
                      const doc = parser.parseFromString(svgText, "image/svg+xml");
                      const svgEl = doc.querySelector("svg");
                      if (!svgEl) return;
                      svgEl.setAttribute("width", "200");
                      svgEl.setAttribute("height", "200");
                      const blob = new Blob([new XMLSerializer().serializeToString(svgEl)], {type: "image/svg+xml"});
                      const url = URL.createObjectURL(blob);
                      F.Image.fromURL(url, (img: any) => {
                        URL.revokeObjectURL(url);
                        if (!img) return;
                        img.set({ left: 100, top: 100 });
                        img.scaleToWidth(80);
                        c.add(img);
                        c.setActiveObject(img);
                        c.requestRenderAll();
                        refreshLayers();
                      }, { crossOrigin: "anonymous" });
                    });"""

if old_handler in src:
    src = src.replace(old_handler, new_handler)
    print("Fix 3a: Replaced loadSVGFromURL with fetch+Image.fromURL")
else:
    # Try partial match
    if "F.loadSVGFromURL(sym.path" in src:
        # Find and replace the block
        idx = src.index("F.loadSVGFromURL(sym.path")
        # Find the matching closing });
        depth = 0
        end = idx
        found_first_brace = False
        for j in range(idx, min(idx+600, len(src))):
            if src[j] == '{':
                depth += 1
                found_first_brace = True
            elif src[j] == '}':
                depth -= 1
                if found_first_brace and depth == 0:
                    # Find the closing );
                    rest = src[j+1:j+5]
                    if ')' in rest:
                        end = j + 1 + rest.index(')') + 1
                    else:
                        end = j + 1
                    break
        old_block = src[idx:end]
        src = src[:idx] + new_handler + src[end:]
        print(f"Fix 3b: Replaced loadSVGFromURL block ({len(old_block)} chars)")
    else:
        print("WARNING: Could not find loadSVGFromURL handler")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
