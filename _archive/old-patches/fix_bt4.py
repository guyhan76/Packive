with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('Raw repr L4481:', repr(lines[4480][:100]))

# Find the span line with "ext-[10px]" (the \t became tab + ext)
target_idx = None
for i, line in enumerate(lines):
    if 'ext-[10px]' in line and 'className' in line:
        target_idx = i
        print(f'Found broken line at L{i+1}')
        break

if target_idx is None:
    print('Target line not found')
    exit()

# Find closing }</span>
end_idx = None
for i in range(target_idx, min(target_idx + 20, len(lines))):
    if '}</span>' in lines[i]:
        end_idx = i
        break

if end_idx is None:
    print('End span not found')
    exit()

print(f'Replacing L{target_idx+1} to L{end_idx+1}')

indent = '                    '
new_block = []
new_block.append(indent + '<span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">{' + chr(10))
new_block.append(indent + '  layer.type === "image" ? "IMG" :' + chr(10))
new_block.append(indent + '  layer.type === "i-text" || layer.type === "text" || layer.type === "textbox" ? "TXT" :' + chr(10))
new_block.append(indent + '  layer.type === "path" ? "PATH" :' + chr(10))
new_block.append(indent + '  layer.type === "polygon" ? "POLY" :' + chr(10))
new_block.append(indent + '  layer.type === "rect" ? "RECT" :' + chr(10))
new_block.append(indent + '  layer.type === "circle" ? "CIR" :' + chr(10))
new_block.append(indent + '  layer.type === "triangle" ? "TRI" :' + chr(10))
new_block.append(indent + '  layer.type === "ellipse" ? "ELL" :' + chr(10))
new_block.append(indent + '  layer.type === "group" ? "GRP" :' + chr(10))
new_block.append(indent + '  layer.type === "line" ? "LINE" :' + chr(10))
new_block.append(indent + '  layer.type?.toUpperCase()?.substring(0, 4) || "OBJ"' + chr(10))
new_block.append(indent + '}</span>' + chr(10))

lines[target_idx:end_idx+1] = new_block
print(f'Inserted {len(new_block)} lines')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print(f'Total lines: {len(lines)}')
