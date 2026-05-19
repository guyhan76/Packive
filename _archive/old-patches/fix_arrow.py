with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# The problem: onClick={ const c = ... } instead of onClick={() => { const c = ... }}
# Find the broken pattern
old = '<button key={sym.id} onClick={\n                    const c = fcRef.current;'
if old not in src:
    # Try without newline
    old = '<button key={sym.id} onClick={'
    idx = src.find(old)
    if idx != -1:
        # Check what comes after
        after_idx = idx + len(old)
        next_chars = src[after_idx:after_idx+60]
        print(f"After onClick={{: {repr(next_chars)}")
        
        # Find the onClick={ and add () => {
        # We need to replace onClick={ ...handler... }} with onClick={() => { ...handler... }}
        onclick_start = src.find("onClick={", idx)
        brace_pos = onclick_start + len("onClick={")
        
        # Check if () => is missing
        following = src[brace_pos:brace_pos+30].strip()
        if following.startswith("const ") or following.startswith("\n"):
            # Missing arrow function wrapper
            # Find the closing }} for this onClick
            depth = 1
            pos = brace_pos
            while depth > 0 and pos < len(src):
                if src[pos] == '{': depth += 1
                elif src[pos] == '}': depth -= 1
                pos += 1
            # pos is after the first closing }
            # Check if there's another } right after (the JSX closing)
            
            # Insert () => { after onClick={
            src = src[:brace_pos] + "() => {" + src[brace_pos:]
            print("Added () => { after onClick={")
            
            # Now find the matching end and ensure proper closing
            # The handler should end with }} (one for arrow, one for JSX)
        else:
            print(f"Arrow function looks present: {following[:30]}")
    else:
        print("Could not find button onClick pattern")
else:
    # Direct replacement
    new = '<button key={sym.id} onClick={() => {\n                    const c = fcRef.current;'
    src = src.replace(old, new)
    print("Fixed: added () => { wrapper")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)

# Verify
with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

for i in range(2430, min(2440, len(lines))):
    print(f'L{i+1}: {lines[i].rstrip()[:160]}')
print(f"\nTotal lines: {len(lines)}")
