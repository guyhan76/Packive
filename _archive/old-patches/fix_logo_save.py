with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

fixes = 0

# Fix 1: Logo size h-8 -> h-16 (2x)
if 'className="h-8 object-contain"' in content:
    content = content.replace('className="h-8 object-contain"', 'className="h-16 object-contain"')
    fixes += 1
    print("Fix 1: Logo h-8 -> h-16 (2x)")

# Fix 2: Save button - text to icon
old_save = '''<button onClick={fileSave} title="Save (Ctrl+S)"
            className="px-3 py-1.5 text-[11px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Save
          </button>'''

new_save = '''<button onClick={fileSave} title="Save (Ctrl+S)"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          </button>'''

if old_save in content:
    content = content.replace(old_save, new_save)
    fixes += 1
    print("Fix 2: Save button -> floppy disk icon")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)

print(f"\nTotal fixes: {fixes}")
