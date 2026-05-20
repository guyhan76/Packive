# Part 1: Improve preflight.ts - better object naming
with open('src/lib/preflight.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Replace the simple name assignment with smarter naming
old_name = '    const name = obj.name || obj.type || "Unknown";'
new_name = """    // Smart naming for better identification
    let name = obj.name || "";
    if (!name || name === "image" || name === "text") {
      if (obj.type === "image") {
        imgCounter++;
        name = \`Image \${imgCounter}\`;
      } else if (obj.type === "i-text" || obj.type === "text" || obj.type === "textbox") {
        const preview = (obj.text || "").substring(0, 25);
        name = preview ? \`Text: "\${preview}"\` : "Text (empty)";
      } else if (obj.type === "rect") {
        name = "Rectangle";
      } else if (obj.type === "circle" || obj.type === "ellipse") {
        name = "Circle";
      } else if (obj.type === "triangle") {
        name = "Triangle";
      } else if (obj.type === "polygon") {
        name = "Shape";
      } else if (obj.type === "path" || obj.type === "group") {
        name = obj.type === "group" ? "Group" : "Path";
      } else {
        name = obj.type || "Object";
      }
    }
    // Store ref for click-to-select
    const objRef = obj;"""

if old_name in src:
    # Add imgCounter before the loop
    src = src.replace(
        '  for (const obj of objects) {\n' + old_name,
        '  let imgCounter = 0;\n  for (const obj of objects) {\n' + new_name
    )
    print('Fix1: Smart object naming added')

# Add objectRef to PreflightIssue interface
old_interface = """export interface PreflightIssue {
  severity: Severity;
  code: string;
  message: string;
  objectName?: string;
  details?: string;
}"""
new_interface = """export interface PreflightIssue {
  severity: Severity;
  code: string;
  message: string;
  objectName?: string;
  details?: string;
  objectRef?: any;  // Reference to canvas object for click-to-select
}"""

if old_interface in src:
    src = src.replace(old_interface, new_interface)
    print('Fix2: objectRef added to interface')

# Add objectRef to all issue pushes
src = src.replace('            objectName: name,\n', '            objectName: name,\n            objectRef: objRef,\n')
# Count replacements
ref_count = src.count('objectRef: objRef')
print(f'Fix3: objectRef added to {ref_count} issues')

with open('src/lib/preflight.ts', 'w', encoding='utf-8') as f:
    f.write(src)

# Part 2: Update UI to support click-to-select
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the issue card div and make it clickable
for i in range(len(lines)):
    if '<div key={idx} className="rounded-xl px-4 py-3 bg-white border border-gray-100' in lines[i]:
        # Add onClick handler and cursor-pointer
        old_line = lines[i]
        lines[i] = old_line.replace(
            '<div key={idx} className="rounded-xl px-4 py-3 bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"',
            '<div key={idx} onClick={() => { if (issue.objectRef) { const cv = fcRef.current; if (cv) { cv.setActiveObject(issue.objectRef); cv.requestRenderAll(); } } }} className="rounded-xl px-4 py-3 bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"'
        )
        if lines[i] != old_line:
            print(f'Fix4 L{i+1}: Issue card now clickable')
        break

# Add a "Select" hint to the issue card
for i in range(len(lines)):
    if "issue.details && <p className" in lines[i] and 'text-xs text-gray-400 mt-1' in lines[i]:
        # Add locate button after details
        indent = '                      '
        locate_line = indent + '{issue.objectRef && <p className="text-[10px] text-blue-400 mt-1.5 font-medium">Click to select object on canvas</p>}\n'
        lines.insert(i + 1, locate_line)
        print(f'Fix5 L{i+1}: Added "click to select" hint')
        break

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('\nDone!')
