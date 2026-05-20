with open('src/lib/preflight.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Check all issues.push blocks - find ones missing objectRef
lines = src.split('\n')
for i, line in enumerate(lines):
    if 'issues.push({' in line:
        # Check next 8 lines for objectRef
        block = '\n'.join(lines[i:i+10])
        has_ref = 'objectRef' in block
        has_name = 'objectName' in block
        # Get the code
        code_match = [l for l in lines[i:i+10] if 'code:' in l]
        code = code_match[0].strip() if code_match else '?'
        print(f'L{i+1}: {code} | objectName: {has_name} | objectRef: {has_ref}')
