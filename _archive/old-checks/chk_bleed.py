with open('src/lib/bleed-guide.ts','r',encoding='utf-8') as f:
    content = f.read()

print(f"File size: {len(content)} bytes")
print(f"Total lines: {content.count(chr(10))+1}")
print()
print("=== Full content ===")
print(content)
