with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find TOP BAR
for i, line in enumerate(lines):
    if '{/* TOP BAR */}' in line:
        print(f"TOP BAR starts at L{i+1}")
        # Print until closing </div>
        for j in range(i, min(i+5, len(lines))):
            print(f"L{j+1}: {lines[j].rstrip()[:180]}")
        break

# Find the h-12 or h-11 line
for i, line in enumerate(lines):
    if ('h-12' in line or 'h-11' in line) and 'TOP BAR' not in line and 'border-b' in line:
        print(f"\nHeader div at L{i+1}: {line.strip()[:180]}")
        break

# Verify Keys button position
for i, line in enumerate(lines):
    if 'Shortcuts' in line and 'F1' in line:
        print(f"\nKeys button at L{i+1}: {line.strip()[:120]}")
        # Show surrounding
        for j in range(max(0,i-2), min(len(lines), i+5)):
            print(f"  L{j+1}: {lines[j].rstrip()[:140]}")
        break
