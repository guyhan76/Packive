with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Revert: remove the normalized scale, back to simple scaleToWidth(80)
old_scale = """// Normalize: target 80px for a 213-unit viewBox (standard)
                        const vbMatch = sym.svg.match(/viewBox="[\\d.]+\\s+[\\d.]+\\s+([\\d.]+)\\s+([\\d.]+)"/);
                        const vbW = vbMatch ? parseFloat(vbMatch[1]) : 200;
                        const vbH = vbMatch ? parseFloat(vbMatch[2]) : 200;
                        const vbMax = Math.max(vbW, vbH);
                        const targetPx = 80;  // base size for 213-unit viewBox
                        const normalizedScale = targetPx * (vbMax / 213);
                        group.scaleToWidth(Math.min(normalizedScale, 150));"""

new_scale = """group.scaleToWidth(80);"""

if old_scale in src:
    src = src.replace(old_scale, new_scale)
    print("REVERTED: Back to scaleToWidth(80)")
else:
    print("Pattern not found")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
