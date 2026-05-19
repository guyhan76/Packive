with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Expose canvas globally for debug
old = 'const [zoom, setZoom] = useState(100);'
new = """const [zoom, setZoom] = useState(100);
  // [BLEED DEBUG] expose canvas globally
  useEffect(() => { (window as any).__pc = fcRef.current; }, []);"""

if '__pc = fcRef' not in content:
    content = content.replace(old, new, 1)
    print("Fix 1: Canvas exposed as window.__pc")
else:
    print("Already exposed")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
