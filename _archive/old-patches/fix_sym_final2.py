import os, re, json

# ============================================
# Step 1: Fix SVG class names - prefix with "s" so they don't start with a digit
# ============================================
svg_dir = "public/symbols"
for fname in sorted(os.listdir(svg_dir)):
    if not fname.endswith(".svg"):
        continue
    fpath = os.path.join(svg_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Find all class references like 3_nife6_c1 (starting with digit)
    # Replace with s3_nife6_c1
    old = content
    # Fix class definitions in <style> and class="" attributes
    content = re.sub(r'(?<=\.)(\d+_)', r's\1', content)  # .3_nife6_c1 -> .s3_nife6_c1
    content = re.sub(r'(?<=class=")(\d+_)', r's\1', content)  # class="3_nife6_c1" -> class="s3_nife6_c1"
    
    # Also fix id attributes starting with digits
    content = re.sub(r'(?<=id=")(\d+_)', r's\1', content)
    
    if content != old:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed digit-prefix in {fname}")
    else:
        print(f"OK: {fname}")

# ============================================
# Step 2: Regenerate packaging-symbols.ts
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
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        svg = f.read().strip()
    ts_lines.append(f'  {{ id: {json.dumps(sid)}, name: {json.dumps(name)}, nameKo: {json.dumps(nameKo)}, category: {json.dumps(cat)}, svg: {json.dumps(svg)}, path: "/symbols/{fname}" }},')

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
print(f"\nRegenerated packaging-symbols.ts: {len(ts_lines)} lines")

# ============================================
# Step 3: Fix click handler - add console.log and use fabric.loadSVGFromString
# ============================================
with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

old_handler_start = "fetch(sym.path).then(r => r.text()).then(svgText =>"

new_click_block = """const c = fcRef.current; if (!c) return;
                    const svgStr = sym.svg.replace(/currentColor/g, "#000000");
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(svgStr, "image/svg+xml");
                    const svgEl = doc.querySelector("svg");
                    if (!svgEl) { console.error("No SVG element found"); return; }
                    if (!svgEl.getAttribute("xmlns")) svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    svgEl.setAttribute("width", "200");
                    svgEl.setAttribute("height", "200");
                    const serialized = new XMLSerializer().serializeToString(svgEl);
                    const encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(serialized)));
                    const F = (window as any).__fabric || fabricModRef.current;
                    if (!F) { console.error("No Fabric instance"); return; }
                    F.Image.fromURL(encoded, (img: any) => {
                      if (!img) { console.error("Fabric Image.fromURL returned null"); return; }
                      img.set({ left: 100, top: 100 });
                      img.scaleToWidth(80);
                      c.add(img);
                      c.setActiveObject(img);
                      c.requestRenderAll();
                      if (typeof refreshLayers === "function") refreshLayers();
                      console.log("Symbol added to canvas:", sym.name);
                    }, { crossOrigin: "anonymous" });
                    setShowSymbolPanel(false);"""

# Find the onClick handler block
idx = src.find("<button key={sym.id} onClick={() => {")
if idx == -1:
    print("ERROR: Could not find symbol button onClick")
else:
    # Find the start of handler body
    brace_start = src.index("{", src.index("{", idx) + 1)  # second { after onClick={() =>
    # Find matching closing
    depth = 1
    pos = brace_start + 1
    while depth > 0 and pos < len(src):
        if src[pos] == '{': depth += 1
        elif src[pos] == '}': depth -= 1
        pos += 1
    # pos is now after the closing }
    # But we also need to skip the }} (one for arrow fn, one for onClick)
    handler_end = pos  # after first }
    # Skip to the closing }}
    while handler_end < len(src) and src[handler_end] in ' \t\n':
        handler_end += 1
    if src[handler_end] == '}':
        handler_end += 1  # skip second }
    
    old_handler = src[brace_start+1:handler_end-1]
    src = src[:brace_start+1] + "\n                    " + new_click_block + "\n                  " + src[handler_end-1:]
    print(f"Replaced click handler ({len(old_handler)} chars)")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
