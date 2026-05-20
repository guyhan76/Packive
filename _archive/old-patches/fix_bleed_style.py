with open('src/lib/bleed-guide.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Make bleed line more visible
content = content.replace(
    'strokeWidth: 1,',
    'strokeWidth: 2,'
)
content = content.replace(
    'strokeDashArray: [6, 3],',
    'strokeDashArray: [10, 5],'
)
content = content.replace(
    'stroke: "#22c55e",',
    'stroke: "#ff3333",'
)

with open('src/lib/bleed-guide.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Bleed style updated: red #ff3333, strokeWidth 2, dash [10,5]")
