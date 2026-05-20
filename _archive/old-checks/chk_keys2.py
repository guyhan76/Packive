with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'setShowShortcuts(true)' in line and 'button' in line:
        for j in range(max(0,i-2), min(len(lines), i+6)):
            print(f"L{j+1}: {lines[j].rstrip()[:160]}")
        print("---")

# Also find left toolbar closing </div>
for i, line in enumerate(lines):
    if 'LEFT TOOLBAR' in line:
        print(f"\nLeft toolbar starts at L{i+1}")
        # Find its closing
        for j in range(i+1, min(i+60, len(lines))):
            if lines[j].strip() == '</div>':
                print(f"Potential close at L{j+1}: {lines[j].rstrip()}")
                # Check context
                if j+1 < len(lines):
                    print(f"  Next: L{j+2}: {lines[j+1].rstrip()[:100]}")
                break
