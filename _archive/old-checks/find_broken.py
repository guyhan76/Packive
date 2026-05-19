with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Find all broken className={ without backtick (not className={{ which is style)
import re
for m in re.finditer(r'className=\{(?!|{)', src):
    start = m.start()
    # get line number
    line_num = src[:start].count('\n') + 1
    line = src.split('\n')[line_num - 1]
    print(f"L{line_num}: {repr(line.rstrip()[:140])}")

print("\n--- title check ---")
for i, line in enumerate(src.split('\n')):
    if 'title={' in line and 't.name' in line:
        print(f"L{i+1}: {repr(line.rstrip()[:120])}")
