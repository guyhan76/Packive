with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Find the ungroup/regroup button
import re
# Find from "Ungroup/Regroup toggle" to the closing button tag
start = content.find('{/* Ungroup/Regroup toggle */')
if start == -1:
    start = content.find('dielineUngrouped ?')
end = content.find('</button>', start) + len('</button>')

snippet = content[start:end]
print(f"Found at char {start}, length {len(snippet)}")
print(snippet[:2000])
