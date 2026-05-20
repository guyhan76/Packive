import os

svg_dir = "public/symbols"

# ============================================
# Handle 1: Full Cut Handle (완전타공) - 좌우 반원형
# All lines are cut lines (solid)
# ============================================
full_cut = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60">
  <path d="M10,60 L10,30 A20,20 0 0,1 10,10 L10,0 L110,0 L110,10 A20,20 0 0,1 110,30 L110,60" 
    fill="none" stroke="#231815" stroke-width="1.5"/>
  <line x1="10" y1="0" x2="110" y2="0" stroke="#231815" stroke-width="1.5"/>
  <line x1="10" y1="60" x2="110" y2="60" stroke="#231815" stroke-width="1.5"/>
</svg>'''

# ============================================
# Handle 2: Half Cut Handle (반타공) - 위는 접힘선, 좌우아래 칼선
# Top line = fold (dashed), left/right/bottom = cut (solid)
# ============================================
half_cut = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60">
  <line x1="10" y1="0" x2="110" y2="0" stroke="#231815" stroke-width="1.5" stroke-dasharray="4,3"/>
  <path d="M10,0 A20,20 0 0,0 10,30 L10,60 L110,60 L110,30 A20,20 0 0,0 110,0" 
    fill="none" stroke="#231815" stroke-width="1.5"/>
</svg>'''

# ============================================
# Handle 3: Finger Hole Circle (손가락 구멍 원형)
# ============================================
finger_circle = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <circle cx="30" cy="30" r="22" fill="none" stroke="#231815" stroke-width="1.5"/>
</svg>'''

# ============================================
# Handle 4: Finger Hole Semi-circle (손가락 구멍 반원형)
# ============================================
finger_semi = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
  <path d="M5,40 L5,20 A25,20 0 0,1 55,20 L55,40" 
    fill="none" stroke="#231815" stroke-width="1.5"/>
  <line x1="5" y1="40" x2="55" y2="40" stroke="#231815" stroke-width="1.5" stroke-dasharray="4,3"/>
</svg>'''

handles = [
    ("39_handle_full_cut.svg", full_cut),
    ("40_handle_half_cut.svg", half_cut),
    ("41_finger_hole_circle.svg", finger_circle),
    ("42_finger_hole_semi.svg", finger_semi),
]

for fname, svg_content in handles:
    fpath = os.path.join(svg_dir, fname)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(svg_content.strip())
    print(f"Created: {fname} ({len(svg_content.strip())} bytes)")

print(f"\n4 handle SVGs created in {svg_dir}/")
