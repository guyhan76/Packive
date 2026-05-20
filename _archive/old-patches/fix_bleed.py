with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixes = 0

# Fix 1: Replace alert on bleed button (L3001-3002) with actual addBleedGuides call
for i in range(len(lines)):
    if 'alert("Bleed guide will be available after Panel Map' in lines[i]:
        # Find the line before (L3001) that handles remove
        # L3001: if (showBleedGuides) { removeBleedGuides(cv); setShowBleedGuides(false); }
        # L3002: else { alert("Bleed guide will be available...
        # Replace L3002 with actual bleed guide add
        indent = '                    '
        lines[i] = (
            indent + 'else {\n' +
            indent + '  const result = await addBleedGuides(cv, {\n' +
            indent + '    scale: scaleRef.current,\n' +
            indent + '    canvasWidth: cv.getWidth(),\n' +
            indent + '    canvasHeight: cv.getHeight(),\n' +
            indent + '    bleedMm: 3,\n' +
            indent + '  });\n' +
            indent + '  if (result) { setShowBleedGuides(true); }\n' +
            indent + '  else { alert("No dieline found. Please generate a dieline first."); }\n' +
            indent + '}\n'
        )
        fixes += 1
        print(f'Fix1 L{i+1}: Replaced alert with addBleedGuides')
        break

# Fix 2: The button onClick needs to be async (for await addBleedGuides)
# Find the button onClick line before the bleed code
for i in range(len(lines)):
    if 'removeBleedGuides(cv); setShowBleedGuides(false)' in lines[i]:
        # Go back to find the onClick
        for j in range(i, max(0, i-5), -1):
            if 'onClick={async' in lines[j]:
                print(f'Button already async at L{j+1}')
                break
            if 'onClick={' in lines[j] and 'async' not in lines[j]:
                lines[j] = lines[j].replace('onClick={async () => {', 'onClick={async () => {')
                # If not already async
                if 'onClick={async' not in lines[j]:
                    lines[j] = lines[j].replace('onClick={() => {', 'onClick={async () => {')
                    fixes += 1
                    print(f'Fix2 L{j+1}: Made onClick async')
                break
        break

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f'\nTotal fixes: {fixes}')

# Verify
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()
print(f'addBleedGuides calls: {src.count("addBleedGuides(")}')
print(f'alert("Bleed guide will be available"): {"Bleed guide will be available" in src}')
print(f'showBleedGuides refs: {src.count("showBleedGuides")}')
