# Check fabric version
import json
with open('package.json','r') as f:
    pkg = json.load(f)

deps = {**pkg.get('dependencies',{}), **pkg.get('devDependencies',{})}
for k,v in deps.items():
    if 'fabric' in k.lower():
        print(f"{k}: {v}")

# Check how fabric is imported in unified-editor
with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i in range(0, min(50, len(lines))):
    if 'fabric' in lines[i].lower() or 'import' in lines[i]:
        print(f"L{i+1}: {lines[i].rstrip()[:200]}")
