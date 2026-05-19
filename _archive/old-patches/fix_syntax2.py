with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixes = 0

for i in range(len(lines)):
    # Fix 1: L2517 title - exact repr shows: title={\n\n}
    if "title={" in lines[i] and "\\n\\n}" in lines[i] and "" not in lines[i]:
        lines[i] = lines[i].replace(
            "title={\\n\\n}",
            "title={${t.name} - }"
        )
        fixes += 1
        print(f"Fix1 L{i+1}: title attribute")

    # Fix 2: L2535 iconSvg - has \x0c (form feed) instead of 'f'
    if "lex items-center justify-center w-full h-full" in lines[i] and "dangerouslySetInnerHTML" in lines[i]:
        import re
        lines[i] = re.sub(
            r'className=\{[^\}]*lex items-center justify-center w-full h-full[^\}]*\}',
            'className={lex items-center justify-center w-full h-full }',
            lines[i]
        )
        fixes += 1
        print(f"Fix2 L{i+1}: iconSvg className")

    # Fix 3: gradient divider lines with #FF0000
    if "via-#FF0000-200" in lines[i]:
        lines[i] = lines[i].replace(
            'className={h-px flex-1 bg-gradient-to-r from-transparent via-#FF0000-200 to-transparent}',
            'className={h-px flex-1 bg-gradient-to-r from-transparent  to-transparent}'
        )
        fixes += 1
        print(f"Fix3 L{i+1}: gradient divider")

    # Fix 4: series label text color with #FF0000
    if "text-#FF0000-500" in lines[i]:
        lines[i] = lines[i].replace(
            'className={\\text-[10px] font-bold text-#FF0000-500 uppercase tracking-wider}',
            'className={	ext-[10px] font-bold  uppercase tracking-wider}'
        )
        # try alternate if backslash variant
        if "#FF0000" in lines[i]:
            import re
            lines[i] = re.sub(
                r'className=\{[^}]*text-#FF0000-500[^}]*\}',
                'className={	ext-[10px] font-bold  uppercase tracking-wider}',
                lines[i]
            )
        fixes += 1
        print(f"Fix4 L{i+1}: series label color")

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"\nTotal fixes: {fixes}")

# Verify no remaining issues
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()
print(f"Remaining #FF0000 in card area: {'#FF0000' in src[src.find('renderGroup'):]}")
print(f"Has \\x0c: {chr(12) in src[src.find('renderCard'):]}")
