with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# The problem is the fileLoadRef input got split across lines with quotes breaking
# Find and fix it
import re

# Find the broken input line around L2202
lines = content.split('\n')
for i in range(2195, min(2210, len(lines))):
    print(f"L{i+1}: {repr(lines[i])}")
