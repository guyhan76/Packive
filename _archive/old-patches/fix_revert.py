with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# 1. Remove convertImgRgbToCmykBinary function entirely
func_start = src.find('function convertImgRgbToCmykBinary(')
if func_start >= 0:
    brace = 0
    func_end = func_start
    found = False
    for i in range(func_start, len(src)):
        if src[i] == '{': brace += 1; found = True
        elif src[i] == '}':
            brace -= 1
            if found and brace == 0: func_end = i + 1; break
    src = src[:func_start] + src[func_end:]
    print('Removed convertImgRgbToCmykBinary function')

# 2. Remove the caller block (Step 7c)
idx = src.find('// Step 7c:')
if idx >= 0:
    line_start = src.rfind('\n', 0, idx) + 1
    end = src.find('const blob = new Blob', idx)
    if end > idx:
        src = src[:line_start] + '  const blob = new Blob' + src[end + len('const blob = new Blob'):]
        print('Removed Step 7c caller')

# 3. Revert outBuf back to const
src = src.replace('let outBuf = new Uint8Array(outLen)', 'const outBuf = new Uint8Array(outLen)')
print('Reverted outBuf to const')

# 4. Keep Step 7b as simple comment
old_7b = src.find('// Step 7b:')
if old_7b >= 0:
    line_start = src.rfind('\n', 0, old_7b) + 1
    line_end = src.find('\n', src.find('\n', old_7b) + 1) + 1
    next_line_end = src.find('\n', line_end) + 1
    # Replace entire 7b block with simple log
    end_of_block = src.find('console.log("[PDF] Step 8:', old_7b)
    if end_of_block > old_7b:
        block_start = src.rfind('\n', 0, old_7b) + 1
        src = src[:block_start] + '  // Step 7b: Vector colors converted to CMYK, images remain DeviceRGB (CMYK-simulated pixels)\n' + src[end_of_block:]
        print('Simplified Step 7b')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
