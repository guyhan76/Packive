with open('src/lib/bleed-guide.ts','r',encoding='utf-8') as f:
    content = f.read()

print(f"Current file: {len(content)} bytes, {content.count(chr(10))+1} lines")

# Find getDielineBBox function to understand current structure
lines = content.split('\n')
for i, line in enumerate(lines):
    print(f"L{i+1}: {line}")
