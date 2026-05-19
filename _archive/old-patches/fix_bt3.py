with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show raw bytes of L4481
line = lines[4480]
print('Raw repr:', repr(line[:120]))

# Fix: replace the broken className with a proper template literal
old = line
# The \t became a tab, so the line has tab + "ext-[10px]..."
# Replace the entire span tag
import re
fixed = re.sub(
    r'<span className=\{.*?ext-\[10px\] px-1 py-0\.5 rounded.*?\}>\{',
    '<span className={	ext-[10px] px-1 py-0.5 rounded 
# L4492 has the last ternary option, L4493 closes with }</span>
# We need: }</span> -> }</span>
# Actually let's look at how it should be:
# <span className={	ext-[10px] ... }>{label}</span>
# But the color class logic is missing. Let's just use a simple static class:
# Replace L4481-L4493 entirely with a cleaner version

# Find the span block
start_idx = 4480
end_idx = None
for i in range(start_idx, min(start_idx + 20, len(lines))):
    if '}</span>' in lines[i]:
        end_idx = i
        break

if end_idx:
    indent = '                    '
    new_block = [
        indent + '<span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">{' + '\n',
        indent + '  layer.type === "image" ? "IMG" :' + '\n',
        indent + '  layer.type === "i-text" || layer.type === "text" || layer.type === "textbox" ? "TXT" :' + '\n',
        indent + '  layer.type === "path" ? "PATH" :' + '\n',
        indent + '  layer.type === "polygon" ? "POLY" :' + '\n',
        indent + '  layer.type === "rect" ? "RECT" :' + '\n',
        indent + '  layer.type === "circle" ? "CIR" :' + '\n',
        indent + '  layer.type === "triangle" ? "TRI" :' + '\n',
        indent + '  layer.type === "ellipse" ? "ELL" :' + '\n',
        indent + '  layer.type === "group" ? "GRP" :' + '\n',
        indent + '  layer.type === "line" ? "LINE" :' + '\n',
        indent + '  layer.type?.toUpperCase()?.substring(0, 4) || "OBJ"' + '\n',
        indent + '}</span>' + '\n',
    ]
    lines[start_idx:end_idx+1] = new_block
    print(f'Replaced L{start_idx+1}-L{end_idx+1} with {len(new_block)} clean lines')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print(f'Total lines: {len(lines)}')
