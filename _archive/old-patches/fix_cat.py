import json, os

# ============================================
# Fix 1: Reorder recycling symbols (PET first)
# Fix 2: Category buttons will be fixed in editor
# ============================================

with open('src/lib/packaging-symbols.ts','r',encoding='utf-8') as f:
    src = f.read()

# Swap HDPE and PET order
hdpe_line = None
pet_line = None
lines = src.split('\n')
new_lines = []
hdpe_entry = None
pet_entry = None

for i, line in enumerate(lines):
    if '"hdpe"' in line and '"HDPE 2"' in line:
        hdpe_entry = line
    elif '"pet"' in line and '"PET 1"' in line:
        pet_entry = line

if hdpe_entry and pet_entry:
    # Swap them
    new_src = src.replace(hdpe_entry, "___PET_PLACEHOLDER___")
    new_src = new_src.replace(pet_entry, hdpe_entry)
    new_src = new_src.replace("___PET_PLACEHOLDER___", pet_entry)
    with open('src/lib/packaging-symbols.ts','w',encoding='utf-8') as f:
        f.write(new_src)
    print("Fix 1: Swapped PET before HDPE")
else:
    print(f"Could not find entries: hdpe={hdpe_entry is not None}, pet={pet_entry is not None}")

# ============================================
# Fix 2: Make category buttons smaller and inline
# ============================================
with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Change flex-wrap to flex-nowrap and reduce button padding
old_cat = 'className="flex gap-1 flex-wrap mb-2"'
new_cat = 'className="flex gap-1 flex-nowrap mb-2 overflow-x-auto"'
if old_cat in src:
    src = src.replace(old_cat, new_cat)
    print("Fix 2a: Changed flex-wrap to flex-nowrap")

# Make category buttons more compact
old_btn = 'className={"px-2 py-0.5 rounded-full text-[9px] font-medium'
new_btn = 'className={"px-1.5 py-0.5 rounded-full text-[8px] font-medium whitespace-nowrap'
if old_btn in src:
    src = src.replace(old_btn, new_btn)
    print("Fix 2b: Made category buttons compact")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
