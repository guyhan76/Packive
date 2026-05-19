with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Core flow status check
checks = {
    '1. Box Selection UI': 'getTemplatesByCategory' in src,
    '2. Dimension Modal': 'showDimModal' in src,
    '3. Dieline Generation': 'generateDieline' in src,
    '4. Canvas Editor (Fabric.js)': 'fabric' in src.lower() or 'canvas' in src,
    '5. Text Tool': 'addText' in src or 'IText' in src,
    '6. Image Upload': 'upload' in src.lower() and 'image' in src.lower(),
    '7. Color Picker (CMYK)': 'cmyk' in src.lower(),
    '8. Spot Colors': 'spot' in src.lower() or 'PACKIVE_SPOT_COLORS' in src,
    '9. Layers Panel': 'layers' in src.lower(),
    '10. Undo/Redo': 'undo' in src and 'redo' in src,
    '11. Snap/Align': 'snap' in src.lower() or 'align' in src.lower(),
    '12. PDF Export': 'pdf' in src.lower() or 'export' in src.lower(),
    '13. 3D Preview': '3d' in src.lower() or 'three' in src.lower() or 'mockup' in src.lower(),
    '14. Preflight Check': 'preflight' in src.lower(),
    '15. Panel Map': 'panelMap' in src or 'PanelMap' in src or 'panel-map' in src,
    '16. Bleed Guide': 'bleed' in src.lower(),
    '17. Ruler': 'Ruler' in src,
    '18. Zoom': 'zoom' in src.lower(),
    '19. Keyboard Shortcuts': 'shortcut' in src.lower() or 'Ctrl+Z' in src,
    '20. Design Templates': 'DESIGN_TEMPLATES' in src,
}

for k, v in checks.items():
    status = 'OK' if v else 'MISSING'
    icon = 'v' if v else 'X'
    print(f'[{icon}] {k}: {status}')

print(f'\nTotal lines: {len(src.splitlines())}')
print(f'File size: {len(src)//1024} KB')
