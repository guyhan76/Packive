with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    s = f.read()

# Find where other leftTab panels are - look for leftTab === "barcode" or "box" or "shapes"
panels = []
for keyword in ['leftTab === "barcode"', 'leftTab === "box"', 'leftTab === "shapes"', 'leftTab === "text"', 'leftTab === "image"']:
    idx = s.find(keyword)
    if idx >= 0:
        ln = s[:idx].count('\n') + 1
        panels.append((ln, keyword))
        print(f'Found: L{ln} {keyword}')

# Find the last panel before canvas
# Look for CANVAS comment
canvas_idx = s.find('CANVAS')
if canvas_idx > 0:
    ln = s[:canvas_idx].count('\n') + 1
    print(f'CANVAS at L{ln}')
    
# Show 5 lines before CANVAS
lines = s.split('\n')
cl = s[:canvas_idx].count('\n')
for i in range(max(0,cl-8), cl+2):
    print(f'L{i+1}: {lines[i][:120]}')
