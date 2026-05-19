with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find Keys button and surrounding context
for i, line in enumerate(lines):
    if 'Keys' in line or 'Shortcuts' in line:
        start = max(0, i-2)
        end = min(len(lines), i+3)
        for j in range(start, end):
            print(f"L{j+1}: {lines[j].rstrip()[:160]}")
        print("---")

# Find top bar section
print("\n=== TOP BAR ===")
for i, line in enumerate(lines):
    if 'TOP BAR' in line:
        start = i
        end = min(len(lines), i+30)
        for j in range(start, end):
            print(f"L{j+1}: {lines[j].rstrip()[:160]}")
        break
