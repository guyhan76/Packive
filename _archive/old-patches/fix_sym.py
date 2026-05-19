with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

fixed = 0
for i, line in enumerate(lines):
    if 'className={px-2 py-0.5 rounded-full' in line:
        lines[i] = line.replace(
            'className={px-2 py-0.5 rounded-full text-[9px] font-medium transition-all }',
            'className={"px-2 py-0.5 rounded-full text-[9px] font-medium transition-all " + (symbolCategory === cat.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}'
        )
        fixed += 1
        print(f'Fixed L{i+1}')
    if 'className={flex flex-col items-center gap-1 p-2' in line:
        lines[i] = line.replace(
            'className={flex flex-col items-center',
            'className={"flex flex-col items-center'
        ).rstrip() + '\n'
        fixed += 1
        print(f'Fixed L{i+1} button class')

# Also fix any other broken template literals in the inserted block
for i in range(2925, min(2975, len(lines))):
    line = lines[i]
    # Fix symbolCategory ternary that lost backticks
    if 'symbolCategory === cat.id ?' in line and '' not in line and '{' not in line:
        pass  # already handled above
    # Check for dangerouslySetInnerHTML
    if 'dangerouslySetInnerHTML' in line and 'currentColor' in line:
        # This should be fine as is
        pass

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.writelines(lines)
print(f'Total fixes: {fixed}')
print(f'Total lines: {len(lines)}')
