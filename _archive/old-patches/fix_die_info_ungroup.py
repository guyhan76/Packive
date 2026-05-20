with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

fixes = 0

# Fix 1: Dieline Off -> Info modal should also hide
# When dielineVisible is false, info modal should not show
# L3093: {dielineInfoVisible && dielineSizes && (
old_modal = 'dielineInfoVisible && dielineSizes && ('
new_modal = 'dielineInfoVisible && dielineVisible && dielineSizes && ('
if old_modal in content and new_modal not in content:
    content = content.replace(old_modal, new_modal, 1)
    fixes += 1
    print("Fix 1: Info modal hidden when dieline is off")

# Fix 2: Info On button should not work when dieline is off
old_info_check = 'const hasDieline = c.getObjects().some((o: any) => o._isGuideLayer || o._isDieLine)'
new_info_check = 'const hasDieline = dielineVisible && c.getObjects().some((o: any) => o._isGuideLayer || o._isDieLine)'
if old_info_check in content:
    content = content.replace(old_info_check, new_info_check)
    fixes += 1
    print("Fix 2: Info toggle blocked when dieline is off")

# Fix 3: Ungroup - fix fabric clone error
# The current code uses F2.util.object.clone which may not exist in Fabric v6/v7
old_clone = 'const F2 = (window as any).fabric; const cl = F2 ? F2.util.object.clone(child) : Object.assign({}, child)'
new_clone = 'let cl: any; try { const F3 = (window as any).fabric; cl = F3?.util?.object?.clone?.(child); if (!cl) { cl = child.toObject ? Object.assign(Object.create(Object.getPrototypeOf(child)), child) : Object.assign({}, child); } } catch(e) { cl = Object.assign({}, child); }'
if old_clone in content:
    content = content.replace(old_clone, new_clone)
    fixes += 1
    print("Fix 3: Ungroup clone - safe fallback")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)

print(f"\nTotal fixes: {fixes}")
