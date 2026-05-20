with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i in range(2039, min(2200, len(lines))):
    ln = lines[i].rstrip()
    print(f"L{i+1}: {ln[:180]}")
    if '      </div>' == ln.strip() and i > 2050:
        if i+1 < len(lines) and ('flex flex-1' in lines[i+1] or 'flex-1 overflow' in lines[i+1] or lines[i+1].strip() == ''):
            print(f"=== HEADER ENDS L{i+1} ===")
            break
