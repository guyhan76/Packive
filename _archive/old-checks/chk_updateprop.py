with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find updateProp function definition
for i, line in enumerate(lines):
    if 'updateProp' in line and ('function' in line or '=>' in line or 'const updateProp' in line or 'def ' in line):
        start = max(0, i-1)
        end = min(len(lines), i+30)
        for j in range(start, end):
            print(f"L{j+1}: {lines[j].rstrip()}")
        print("===")
        break

# Find where fill color is actually set on objects
for i, line in enumerate(lines):
    if 'set(' in line and ("'fill'" in line or '"fill"' in line) and 'active' in lines[max(0,i-5):i+3].__repr__().lower():
        start = max(0, i-3)
        end = min(len(lines), i+5)
        for j in range(start, end):
            print(f"L{j+1}: {lines[j].rstrip()}")
        print("---")
