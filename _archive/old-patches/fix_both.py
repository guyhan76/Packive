import os, re

# ===== Fix 1: Add square border to 6_fire1.svg and 21_recycle2.svg =====

# 6_fire1.svg - replace rounded rect border with square stroke rect
with open('public/symbols/6_fire1.svg', 'r', encoding='utf-8') as f:
    content = f.read()

old_fire_border = '<path class="s6_fire1_c1" d="M7.2,0C3.36-.02.22,2.84.2,6.38L0,51.89c-.02,3.53,3.1,6.43,6.95,6.44l45.45.2c3.81.02,6.93-2.85,6.95-6.38l.2-45.51c.02-3.54-3.08-6.43-6.89-6.44L7.2,0ZM2.55,51.9l.2-45.51c.01-2.13,2-3.85,4.44-3.84l45.46.2c2.41.01,4.36,1.75,4.35,3.88l-.2,45.51c0,2.13-1.98,3.85-4.38,3.84l-45.46-.2c-2.44-.01-4.41-1.75-4.4-3.88Z"/>'
new_fire_border = '<rect x="1.5" y="1.5" width="56.55" height="55.53" fill="none" stroke="#231815" stroke-width="3"/>'

if old_fire_border in content:
    content = content.replace(old_fire_border, new_fire_border)
    with open('public/symbols/6_fire1.svg', 'w', encoding='utf-8') as f:
        f.write(content)
    print("FIXED: 6_fire1.svg - square border")
else:
    print("NOT FOUND: 6_fire1.svg border")

# 21_recycle2.svg - add square border (currently has none)
with open('public/symbols/21_recycle2.svg', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a rect border before closing </g> of the inner group
# The viewBox of inner content is ~51.1 x 50.2
insert_before = '</g>\n\n</g>\n</svg>'
insert_with = '<rect x="0" y="0" width="51.1" height="50.2" fill="none" stroke="#231815" stroke-width="3"/>\n</g>\n\n</g>\n</svg>'

if insert_before in content:
    content = content.replace(insert_before, insert_with)
    with open('public/symbols/21_recycle2.svg', 'w', encoding='utf-8') as f:
        f.write(content)
    print("FIXED: 21_recycle2.svg - added square border")
else:
    # Try alternate ending
    alt = '</g>\n</g>\n</svg>'
    alt_new = '<rect x="0" y="0" width="51.1" height="50.2" fill="none" stroke="#231815" stroke-width="3"/>\n</g>\n</g>\n</svg>'
    if alt in content:
        content = content.replace(alt, alt_new, 1)
        with open('public/symbols/21_recycle2.svg', 'w', encoding='utf-8') as f:
            f.write(content)
        print("FIXED: 21_recycle2.svg - added square border (alt)")
    else:
        print("NOT FOUND: 21_recycle2.svg - printing end:")
        print(repr(content[-200:]))

# ===== Fix 2: Fill color propagation - skip fill:none objects =====

with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

fix_count = 0

# Fix fill propagation - only change children that have an existing fill (not none/transparent)
old_fill = """else if (key === "fill") {
      obj.set({ fill: value });
      if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { child.set({ fill: value }); if (child._objects) child._objects.forEach((gc: any) => gc.set({ fill: value })); }); }
    }"""

new_fill = """else if (key === "fill") {
      obj.set({ fill: value });
      if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { const cf = child.fill; if (cf && cf !== "none" && cf !== "transparent" && cf !== "") { child.set({ fill: value }); } if (child._objects) child._objects.forEach((gc: any) => { const gf = gc.fill; if (gf && gf !== "none" && gf !== "transparent" && gf !== "") { gc.set({ fill: value }); } }); }); }
    }"""

if old_fill in src:
    src = src.replace(old_fill, new_fill)
    fix_count += 1
    print("FIXED: fill propagation - now skips fill:none children")

# Fix fillCmyk propagation
old_fcmyk = 'if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { child.set({ fill: hex }); if (child._objects) child._objects.forEach((gc: any) => gc.set({ fill: hex })); }); }'
new_fcmyk = 'if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { const cf = child.fill; if (cf && cf !== "none" && cf !== "transparent" && cf !== "") { child.set({ fill: hex }); } if (child._objects) child._objects.forEach((gc: any) => { const gf = gc.fill; if (gf && gf !== "none" && gf !== "transparent" && gf !== "") { gc.set({ fill: hex }); } }); }); }'

src = src.replace(old_fcmyk, new_fcmyk)
fix_count += 1
print("FIXED: fillCmyk propagation - now skips fill:none children")

# Fix spotFill propagation
old_sfill_prop = 'if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { child.set({ fill: s.hex }); if (child._objects) child._objects.forEach((gc: any) => gc.set({ fill: s.hex })); }); }'
new_sfill_prop = 'if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { const cf = child.fill; if (cf && cf !== "none" && cf !== "transparent" && cf !== "") { child.set({ fill: s.hex }); } if (child._objects) child._objects.forEach((gc: any) => { const gf = gc.fill; if (gf && gf !== "none" && gf !== "transparent" && gf !== "") { gc.set({ fill: s.hex }); } }); }); }'

if old_sfill_prop in src:
    src = src.replace(old_sfill_prop, new_sfill_prop)
    fix_count += 1
    print("FIXED: spotFill propagation - now skips fill:none children")

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)

print(f"\nTotal tsx fixes: {fix_count}")
print(f"Total lines: {len(src.splitlines())}")
