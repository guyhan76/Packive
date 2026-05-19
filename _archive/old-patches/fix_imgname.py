with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Find the image naming logic in refreshLayers
# Current: extracts filename from src URL, falls back to "Image N"
# Problem: base64 data URLs produce garbage names

old = '''if (o.type === "image") {
          const src = o._element?.src || o._originalElement?.src || "";
          const fname = src.split("/").pop()?.split("?")[0] || "";
          if (fname && fname.length > 3) return fname.length > 18 ? fname.substring(0, 15) + "..." : fname;
          return "Image " + (imgCount++);
        }'''

new = '''if (o.type === "image") {
          const elSrc = o._element?.src || o._originalElement?.src || "";
          if (elSrc.startsWith("data:")) return "Image " + (imgCount++);
          const fname = elSrc.split("/").pop()?.split("?")[0] || "";
          if (fname && fname.length > 3 && !fname.startsWith("data")) return fname.length > 18 ? fname.substring(0, 15) + "..." : fname;
          return "Image " + (imgCount++);
        }'''

if old in src:
    src = src.replace(old, new)
    print('Fixed image naming: skip base64 URLs')
else:
    print('Pattern not found, trying flexible match')
    import re
    src = re.sub(
        r'if \(o\.type === "image"\) \{\s*const src = o\._element',
        'if (o.type === "image") {\n          const elSrc = o._element',
        src
    )
    src = src.replace(
        'const fname = src.split("/").pop()',
        'if (elSrc.startsWith("data:")) return "Image " + (imgCount++);\n          const fname = elSrc.split("/").pop()'
    )
    print('Applied flexible fix')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
