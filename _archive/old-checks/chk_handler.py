with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find the symbol click handler (loadSVGFromString or FabricImage)
for i, line in enumerate(lines):
    if 'loadSVGFromString' in line or ('sym.svg' in line and 'replace' in line) or ('sym.path' in line and 'fetch' in line):
        start = max(0, i-2)
        end = min(len(lines), i+15)
        print(f"=== L{start+1}-L{end} ===")
        for j in range(start, end):
            print(f"L{j+1}: {lines[j].rstrip()}")
        print()

# Also check how loadSVGFromString is used elsewhere in the project
import os
for root, dirs, files in os.walk('src'):
    for fn in files:
        if fn.endswith('.tsx') or fn.endswith('.ts'):
            fp = os.path.join(root, fn)
            with open(fp, 'r', encoding='utf-8') as f2:
                content = f2.read()
            if 'loadSVGFromString' in content:
                print(f"File: {fp}")
                for k, ln in enumerate(content.splitlines()):
                    if 'loadSVGFromString' in ln:
                        print(f"  L{k+1}: {ln.strip()[:200]}")

# Check Fabric version
import json
with open('package.json','r') as pj:
    pkg = json.load(pj)
deps = {**pkg.get('dependencies',{}), **pkg.get('devDependencies',{})}
for k,v in deps.items():
    if 'fabric' in k.lower():
        print(f"\nFabric version: {k} = {v}")
