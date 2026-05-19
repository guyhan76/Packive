with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Check if Ungroup/Regroup exist anywhere
import re
for kw in ['Ungroup', 'ungroup', 'Regroup', 'regroup', 'Panel Map', 'panelMap', 'generatePanelMap']:
    matches = [(i+1) for i, line in enumerate(content.split('\n')) if kw in line]
    if matches:
        print(f"'{kw}' found at lines: {matches[:5]}")
    else:
        print(f"'{kw}' NOT FOUND")
