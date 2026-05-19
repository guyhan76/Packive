with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Find keyboard event handler
import re

# Check for keydown handler
for m in re.finditer(r'keydown|KeyboardEvent|handleKey|onKeyDown', src):
    line_num = src[:m.start()].count('\n') + 1
    start = max(0, m.start()-40)
    end = min(len(src), m.end()+60)
    print(f"L{line_num}: {src[start:end].replace(chr(10),' ')[:120]}")

print()

# Check for Ctrl+C, Ctrl+V patterns
for pattern in ['ctrl.*c', 'ctrlKey.*KeyC', 'copy', 'paste', 'undo', 'ctrl']:
    count = len(re.findall(pattern, src, re.IGNORECASE))
    if count > 0:
        print(f"Pattern '{pattern}': {count} matches")

print()

# Check if useEffect for keyboard is present
effects = [(m.start(), src[:m.start()].count('\n')+1) for m in re.finditer(r'useEffect\(\s*\(\)\s*=>\s*\{', src)]
print(f"Total useEffect blocks: {len(effects)}")

# Check for addEventListener('keydown')
for m in re.finditer(r"addEventListener\(['\"]keydown", src):
    line_num = src[:m.start()].count('\n') + 1
    print(f"L{line_num}: addEventListener keydown")

for m in re.finditer(r"removeEventListener\(['\"]keydown", src):
    line_num = src[:m.start()].count('\n') + 1
    print(f"L{line_num}: removeEventListener keydown")
