with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Check if any input in handle panel or symbol panel captures focus
# Check the keyboard handler - what tags are excluded
import re
for m in re.finditer(r'tagName.*INPUT|tagName.*SELECT|tagName.*TEXTAREA|activeElement', src):
    line_num = src[:m.start()].count('\n') + 1
    start = max(0, m.start()-20)
    end = min(len(src), m.end()+80)
    snippet = src[start:end].replace('\n',' ')
    if line_num > 890 and line_num < 1460:
        print(f"L{line_num}: ...{snippet[:150]}...")
