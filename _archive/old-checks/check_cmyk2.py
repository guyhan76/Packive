# Test: what does srgbToCmyk return for white and black?
# Simulate the conversion logic
# White: RGB(255,255,255) should give CMYK(0,0,0,0) -> bytes(0,0,0,0)
# Black: RGB(0,0,0) should give CMYK(0,0,0,100) -> bytes(0,0,0,255)

# Check the actual function output
import subprocess
result = subprocess.run(['node', '-e', '''
const { srgbToCmyk, loadFOGRA39LUT, isReverseLUTReady } = require("./src/lib/cmyk-engine");
// Can't use ES modules directly, check if there's a compiled version
'''], capture_output=True, text=True, cwd='.')
print(result.stdout)
print(result.stderr[:500] if result.stderr else '')

# Instead, check the header replacement logic
with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Find the patch application area
idx = src.find('patches.sort')
if idx > 0:
    block = src[idx:idx+800]
    print('=== Patch application ===')
    print(block[:800])

# Also check: does newHeader include >> before stream?
idx2 = src.find("const newHeader = header.substring")
if idx2 > 0:
    print('\n=== Header construction ===')
    print(src[idx2:idx2+300])
