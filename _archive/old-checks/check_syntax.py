with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find title= line
for i, line in enumerate(lines):
    if 'title={' in line and 't.name' in line:
        print(f'L{i+1}: {repr(line.rstrip())}')

# Find remaining issues
for i, line in enumerate(lines):
    if 'lex items-center' in line and 'className' in line:
        print(f'L{i+1} iconSvg: {repr(line.rstrip()[:120])}')
    if '#FF0000' in line:
        print(f'L{i+1} color: {repr(line.rstrip()[:120])}')
    if 'className={' in line and '' not in line and 'className={{' not in line:
        stripped = line.strip()
        if stripped.startswith('<') or 'className={' in stripped:
            # check if it's a dynamic className missing backticks
            import re
            match = re.search(r'className=\{([^}]+)\}', line)
            if match and ('$' in match.group(1) or ' ' in match.group(1)):
                print(f'L{i+1} missing backtick: {repr(line.rstrip()[:140])}')
