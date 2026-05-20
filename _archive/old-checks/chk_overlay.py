with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find the info modal and dimension overlay around L3060-3120
print("=== INFO MODAL + DIMENSION OVERLAY (L3060-3140) ===")
for i in range(3059, min(3140, len(lines))):
    print(f"L{i+1}: {lines[i].rstrip()[:200]}")
