with open('src/lib/bleed-guide.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'strokeWidth: 2,',
    'strokeWidth: 1,'
)
content = content.replace(
    'strokeDashArray: [10, 5],',
    'strokeDashArray: [],'
)

with open('src/lib/bleed-guide.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Bleed style: thin solid red line")
