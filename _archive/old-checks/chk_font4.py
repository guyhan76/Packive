with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Show context around L3221
print("=== Around L3221 ===")
for i in range(3216, min(3230, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:160]}')

print()
print("=== Around L3319 ===")
for i in range(3314, min(3328, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:160]}')
