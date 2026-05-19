with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Remove old debug
if '__pc = fcRef' in content:
    content = content.replace("""  // [BLEED DEBUG] expose canvas globally
  useEffect(() => { (window as any).__pc = fcRef.current; }, []);""", '', 1)
    print("Removed old debug")

# Add at canvas init point - find where fcRef.current is assigned
old = 'fcRef.current = c;'
new = 'fcRef.current = c; (window as any).__pc = c;'

count = content.count(old)
print(f"Found 'fcRef.current = c;' {count} times")

if count > 0 and '(window as any).__pc = c;' not in content:
    content = content.replace(old, new, 1)
    print("Fix: Canvas exposed at init point")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
