with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# L2083 (index 2082) is the duplicate - remove it
dup_line = lines[2082].strip()
print(f"Removing L2083: {dup_line[:100]}")

del lines[2082]

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.writelines(lines)

total = len(lines)
print(f"FIXED: Removed duplicate <input> tag")
print(f"Total lines: {total}")
