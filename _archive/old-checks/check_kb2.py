with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show the first keyboard useEffect (L1230~L1280)
print('=== First keyboard useEffect (space/pan) ===')
for i in range(1230, min(1265, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:160]}')

print('\n=== Second keyboard useEffect (shortcuts) ===')
for i in range(1280, min(1420, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:160]}')

# Check useEffect dependency arrays
print('\n=== useEffect dependencies ===')
for i in range(len(lines)):
    if 'useEffect' in lines[i]:
        # Find closing of useEffect (the dependency array)
        depth = 0
        for j in range(i, min(i+200, len(lines))):
            depth += lines[j].count('{') - lines[j].count('}')
            if '], [' in lines[j] or ']);' in lines[j] or '], []' in lines[j]:
                if j > i:
                    print(f'L{i+1} useEffect -> deps at L{j+1}: {lines[j].rstrip()[:150]}')
                    break
