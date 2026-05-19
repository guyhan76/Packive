with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

fixes = 0

# Fix 1: Center the dieline tools
# Current: LEFT(logo+tools) | flex-1(empty) | RIGHT(undo/zoom/save)
# Change to: LEFT(logo) | flex-1 | CENTER(tools) | flex-1 | RIGHT(undo/zoom/save)

# Find the header structure and rearrange
old_center_section = '''        <div className="w-px h-6 bg-gray-200 mx-2" />

        {/* CENTER: Dieline tools (icon buttons) */}
        <div className="flex items-center gap-1">'''

new_center_section = '''        <div className="flex-1" />

        {/* CENTER: Dieline tools (icon buttons) */}
        <div className="flex items-center gap-1">'''

if old_center_section in content:
    content = content.replace(old_center_section, new_center_section)
    fixes += 1
    print("Fix 1a: Added flex-1 before center tools")

# Remove the old flex-1 between tools and right side
old_flex = '''        </div>

        <div className="flex-1" />

        {/* RIGHT: Undo/Redo + Zoom + Save/Export */}'''
new_flex = '''        </div>

        <div className="flex-1" />

        {/* RIGHT: Undo/Redo + Zoom + Save/Export */}'''

# This is the same, so find the specific location
# The flex-1 after center tools div (</div>) before RIGHT section
# We need to ensure there's flex-1 on both sides of center

if old_flex in content:
    print("Fix 1b: flex-1 after center tools already exists")
    fixes += 1

# Fix 2: Left panel z-index - panels should be above ruler
# Find where panels are rendered and add z-index
old_panel_class = 'className="w-14 bg-[#fafafa] border-r border-gray-200 flex flex-col items-center py-2 shrink-0 overflow-y-auto gap-0.5"'
if old_panel_class in content:
    print("Found left toolbar")

# The issue is the popup panels from left toolbar are behind the ruler
# Find where shape/symbol panels open - they need higher z-index
# Look for the panel overlay positioning

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)

print(f"Total fixes so far: {fixes}")
