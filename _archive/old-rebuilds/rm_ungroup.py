with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

old_start = '{/* Ungroup/Regroup toggle */}'
start_idx = content.find(old_start)
if start_idx == -1:
    print("NOT FOUND")
    exit()

end_marker = '{dielineUngrouped ? "Regroup" : "Ungroup"}'
end_idx = content.find(end_marker, start_idx)
end_idx = content.find('</button>', end_idx) + len('</button>')
if content[end_idx:end_idx+1] == '\n':
    end_idx += 1

removed = content[start_idx:end_idx]
print(f"Removing: {len(removed)} chars")

content = content[:start_idx] + content[end_idx:]

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)

print("DONE: Ungroup/Regroup button removed from header")
