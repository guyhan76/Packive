with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find symbol panel and show 20 lines before it
for i, line in enumerate(lines):
    if 'showSymbolPanel && (' in line:
        print(f'=== L{i-9} to L{i+5} ===')
        for j in range(max(0,i-10), min(i+5, len(lines))):
            print(f'L{j+1}: {lines[j].rstrip()[:160]}')
        break

# Also find the Symbols button
print()
for i, line in enumerate(lines):
    if 'setShowSymbolPanel' in line:
        print(f'L{i+1}: {lines[i].rstrip()[:160]}')
