with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the useEffect that contains L1238 (onKeyDown for space/pan)
# Search backwards from L1238 to find useEffect start
for i in range(1237, 0, -1):
    if 'useEffect' in lines[i]:
        print(f'useEffect starts at L{i+1}')
        break

# Find the cleanup/return of this useEffect
# Show L1260 to L1285 to see the cleanup
for i in range(1260, min(1290, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:160]}')

# Also check: is L1238 onKeyDown blocking other handlers?
print('\n=== L1238 full line ===')
print(repr(lines[1237]))
