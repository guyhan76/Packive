with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Find where dimension arrows/labels are created and what flags they get
import re
lines = content.split('\n')
for i, line in enumerate(lines):
    if any(k in line for k in ['_isDimLine', '_isDimArrow', '_isDimLabel', 'arrowPath', 'dimLine', 'dimension-']):
        print(f"L{i+1}: {line.strip()[:180]}")
    # Also check where text objects with mm values are created
    if 'mm' in line and ('new ' in line or 'Text(' in line) and i > 500:
        print(f"L{i+1}: {line.strip()[:180]}")
