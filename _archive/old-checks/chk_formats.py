with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Check file accept attribute
import re
accepts = re.findall(r'accept="([^"]*)"', content)
for a in accepts:
    print(f"File accept: {a}")

# Check convert-file API
import os
if os.path.exists('src/app/api/convert-file/route.ts'):
    with open('src/app/api/convert-file/route.ts','r',encoding='utf-8') as f:
        conv = f.read()
    print(f"\nconvert-file route: {len(conv)} bytes")
    # Check supported formats
    for line in conv.split('\n'):
        if any(k in line.lower() for k in ['eps', 'pdf', 'svg', 'ai', 'accept', 'mime', 'format']):
            print(f"  {line.strip()[:150]}")
