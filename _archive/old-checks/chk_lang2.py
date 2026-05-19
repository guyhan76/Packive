with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check renderCard around L2686-2690 where name/description is shown
for i in range(2684, min(2695, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()[:200]}")
