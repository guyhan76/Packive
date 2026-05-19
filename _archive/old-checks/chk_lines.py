with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print full content of L2480 and L2485
print("=== L2480 (Full Cut) ===")
print(lines[2479].rstrip())
print()
print("=== L2485 (Half Cut) ===")
print(lines[2484].rstrip())
