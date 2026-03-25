
## DO NOT TOUCH - Keyboard Shortcuts (Ctrl+C/V/X/Z/Y/S/A)

**Date added: 2026-03-24**

The keyboard shortcut handler in src/components/editor/unified-editor.tsx (lines ~1235-1365) has been broken and restored multiple times. 

### ABSOLUTE RULES:
1. **NEVER modify, move, or delete the keyboard shortcut useEffect block** (search: // ─── Keyboard shortcuts ───)
2. **NEVER add code that can cause runtime errors** inside or near the shortcut handler - a runtime crash kills ALL shortcuts
3. **NEVER add canvas overlay objects (fabric.Rect, fabric.Text) in the panel map code** - runtime errors from these crashed the component and disabled shortcuts previously
4. **Any new feature that touches unified-editor.tsx MUST verify shortcuts still work** after implementation (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z, Ctrl+Y, Ctrl+S)
5. **Before ANY modification to unified-editor.tsx, always backup first**

### History of breakages:
- Panel overlay fabric.Rect/Text creation caused runtime errors → shortcuts died
- Template literal backtick escaping in PowerShell broke JSX → component crashed → shortcuts died  
- Missing closing braces caused syntax errors → component crashed → shortcuts died

