# Check packaging-symbols.ts content
with open('src/lib/packaging-symbols.ts','r',encoding='utf-8') as f:
    lines = f.readlines()

print(f"=== packaging-symbols.ts ({len(lines)} lines) ===")
for i, line in enumerate(lines):
    print(f'L{i+1}: {line.rstrip()[:200]}')

print("\n=== Sample SVG file content (1_glass.svg) ===")
with open('public/symbols/1_glass.svg','r',encoding='utf-8') as f:
    content = f.read()
print(content[:500])

print("\n=== Sample SVG file content (2_umbreller1.svg) ===")
with open('public/symbols/2_umbreller1.svg','r',encoding='utf-8') as f:
    content = f.read()
print(content[:500])
