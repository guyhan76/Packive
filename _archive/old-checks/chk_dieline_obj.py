with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find where dieline SVG is loaded and how objects are tagged
print("=== Dieline loading / tagging ===")
for i, line in enumerate(lines):
    s = line.rstrip()
    if any(kw in s for kw in ['_isDieLine', '_isDieline', 'loadSVGFromString', 'loadSVGFromURL', 'fabric.loadSVG', 'enlivenObjects', 'groupSVGElements']):
        if len(s) > 300:
            s = s[:300]
        print(f"L{i+1}: {s}")

print("\n=== Dieline object types ===")
for i, line in enumerate(lines):
    s = line.rstrip()
    if '_isDieLine' in s and ('path' in s.lower() or 'type' in s.lower() or 'group' in s.lower()):
        if len(s) > 300:
            s = s[:300]
        print(f"L{i+1}: {s}")

print("\n=== SVG parse / import ===")
for i, line in enumerate(lines):
    s = line.rstrip()
    if any(kw in s for kw in ['parseSVG', 'loadSVG', 'svgString', 'svgContent']):
        if len(s) > 300:
            s = s[:300]
        print(f"L{i+1}: {s}")
