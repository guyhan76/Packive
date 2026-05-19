with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Count all Keys/Shortcuts buttons
count = 0
for i, line in enumerate(lines):
    if 'setShowShortcuts(true)' in line:
        count += 1
        print(f"L{i+1}: {line.strip()[:120]}")

print(f"\nTotal Keys buttons: {count}")

# Show L2245-L2260
print("\n=== L2245-L2260 ===")
for i in range(2244, min(2260, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()[:160]}")
