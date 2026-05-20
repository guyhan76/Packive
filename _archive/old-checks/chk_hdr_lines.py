with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find exact line indices for L2055-2064 (dieline tools section)
# We need to replace L2056 (New), L2057 (Upload), L2058 (divider), 
# L2059 (Die), L2060 (Info), L2061 (Lock), L2062 (Ungroup), L2063 (Regroup), L2064 (divider)

# Get the full content of each line first
for i in range(2055, min(2065, len(lines))):
    print(f"L{i+1} ({len(lines[i])} chars): {lines[i].rstrip()[:250]}")
