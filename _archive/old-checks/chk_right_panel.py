with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Find right panel width
import re
# Look for the right panel container
for match in re.finditer(r'(Props|AI|Layers).*?className="([^"]*)"', content[:5000]):
    pass

# Search for right panel width definition
lines = content.split('\n')
print("=== Right panel width ===")
for i, line in enumerate(lines):
    if ('Props' in line or 'rightPanel' in line or 'w-[' in line or 'w-72' in line or 'w-80' in line or 'w-64' in line) and i > 2200 and i < 3500:
        if 'className' in line:
            print(f"L{i+1}: {line.strip()[:200]}")

# Find the right sidebar container
print("\n=== Right sidebar ===")
for i, line in enumerate(lines):
    if ('Props' in line or 'Layers' in line) and 'tab' in line.lower():
        print(f"L{i+1}: {line.strip()[:200]}")
    if 'w-[280' in line or 'w-[300' in line or 'w-[260' in line or 'w-[320' in line:
        print(f"L{i+1}: {line.strip()[:200]}")
