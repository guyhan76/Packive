with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print L2040-L2212 with only non-empty lines containing buttons or key elements
for i in range(2039, min(2212, len(lines))):
    ln = lines[i].strip()
    if any(k in ln for k in ['button', 'Button', 'onClick', 'className="px', 'className="w-', 'div className', 'flex-1', 'Undo', 'Redo', 'zoom', 'Save', 'Export', 'Load', 'New', 'Upload', 'Lock', 'Ungroup', 'Visible', 'dieline', 'onBack', 'boxType', '</div>']):
        print(f"L{i+1}: {ln[:180]}")
