import os, re, json

svg_dir = "public/symbols"

# Read existing file
with open("src/lib/packaging-symbols.ts", "r", encoding="utf-8") as f:
    src = f.read()

# New handle entries
new_handles = [
    ("39_handle_full_cut.svg", "handle-full-cut", "Full Cut Handle", "handle"),
    ("40_handle_half_cut.svg", "handle-half-cut", "Half Cut Handle", "handle"),
    ("41_finger_hole_circle.svg", "finger-hole-circle", "Finger Hole (Circle)", "handle"),
    ("42_finger_hole_semi.svg", "finger-hole-semi", "Finger Hole (Semi)", "handle"),
]

# Build new entries
new_entries = []
for fname, sid, name, cat in new_handles:
    fpath = os.path.join(svg_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        svg = f.read().strip()
    new_entries.append(f'  {{ id: {json.dumps(sid)}, name: {json.dumps(name)}, category: {json.dumps(cat)}, svg: {json.dumps(svg)}, path: "/symbols/{fname}" }},')

# Insert before the closing ];
insert_text = '\n'.join(new_entries)
src = src.replace('\n];', '\n' + insert_text + '\n];', 1)

# Add "handle" category
old_cats = "  { id: \"certification\", name: \"Certification\" },"
new_cats = old_cats + '\n  { id: "handle", name: "Handle" },'
src = src.replace(old_cats, new_cats)

with open("src/lib/packaging-symbols.ts", "w", encoding="utf-8") as f:
    f.write(src)

# Count symbols
count = src.count('{ id: "')
print(f"Updated packaging-symbols.ts: {count} symbols (4 handles added)")
print(f"Total lines: {len(src.splitlines())}")
