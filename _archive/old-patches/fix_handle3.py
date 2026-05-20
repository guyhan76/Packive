with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Fix 1: Half Cut Handle preview - still clipped in panel
# The preview SVG uses strokeWidth (JSX) - need to fix viewBox there too
# Check current state
import re

# Find all Half Cut preview patterns
count = 0

# Fix Half Cut preview that still has old viewBox
old_half_p2 = 'className="w-full h-10"><line x1="15" y1="7"'
if old_half_p2 in src:
    print("Found old half cut preview coords")

# Let me check what the preview actually has
idx = src.find("Half Cut Handle")
if idx > 0:
    block = src[max(0,idx-500):idx]
    print("Before Half Cut Handle label:")
    print(block[-300:])

print("\n---\n")

# Fix 2: Full Cut and Square stroke-width from 2 to 1 in canvas SVGs
# Full Cut canvas SVG
src = src.replace(
    'width="280" height="110" viewBox="0 0 140 55"><rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" stroke-width="2"/>',
    'width="280" height="110" viewBox="0 0 140 55"><rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" stroke-width="1"/>'
)
print("Fix: Full Cut stroke-width 2->1")

# Square canvas SVG
src = src.replace(
    'width="120" height="120" viewBox="0 0 60 60"><rect x="8" y="8" width="44" height="44" fill="none" stroke="#FF0000" stroke-width="2"/>',
    'width="120" height="120" viewBox="0 0 60 60"><rect x="8" y="8" width="44" height="44" fill="none" stroke="#FF0000" stroke-width="1"/>'
)
print("Fix: Square stroke-width 2->1")

# Circle canvas SVG
src = src.replace(
    'width="120" height="120" viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" fill="none" stroke="#FF0000" stroke-width="2"/>',
    'width="120" height="120" viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" fill="none" stroke="#FF0000" stroke-width="1"/>'
)
print("Fix: Circle stroke-width 2->1")

# Semi canvas SVG
src = src.replace(
    'width="120" height="80" viewBox="0 0 60 40"><line x1="5" y1="5" x2="55" y2="5" stroke="#FF0000" stroke-width="2"/><path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" stroke-width="2"/>',
    'width="120" height="80" viewBox="0 0 60 40"><line x1="5" y1="5" x2="55" y2="5" stroke="#FF0000" stroke-width="1"/><path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" stroke-width="1"/>'
)
print("Fix: Semi stroke-width 2->1")

# Half Cut canvas SVG - also reduce to 1
src = src.replace(
    'width="320" height="110" viewBox="0 0 160 55"><line x1="25" y1="7" x2="135" y2="7" stroke="#00AA00" stroke-width="2"/><path d="M25,7 A20,20 0 0,0 25,47 L135,47 A20,20 0 0,0 135,7" fill="none" stroke="#FF0000" stroke-width="2"/>',
    'width="320" height="110" viewBox="0 0 160 55"><line x1="25" y1="7" x2="135" y2="7" stroke="#00AA00" stroke-width="1"/><path d="M25,7 A20,20 0 0,0 25,47 L135,47 A20,20 0 0,0 135,7" fill="none" stroke="#FF0000" stroke-width="1"/>'
)
print("Fix: Half Cut canvas stroke-width 2->1")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"\nTotal lines: {len(src.splitlines())}")
