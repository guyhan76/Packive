with open('src/lib/panel-map.ts','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print panelToCanvas function (L218 to end)
for i in range(217, len(lines)):
    print(f"L{i+1}: {lines[i].rstrip()}")
