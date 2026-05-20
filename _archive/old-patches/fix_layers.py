with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Replace the name generation in refreshLayers
old_name = '''name: o.text ? (o.text.substring(0, 20) + (o.text.length > 20 ? "..." : "")) : (o.type === "image" ? "Image" : o.type || "Shape"),'''

new_name = '''name: (() => {
        if (o.type === "i-text" || o.type === "text" || o.type === "textbox") {
          const preview = (o.text || "").substring(0, 15);
          return preview ? preview + (o.text.length > 15 ? "..." : "") : "Empty Text";
        }
        if (o.type === "image") {
          const src = o._element?.src || o._originalElement?.src || "";
          const fname = src.split("/").pop()?.split("?")[0] || "";
          if (fname && fname.length > 3) return fname.length > 18 ? fname.substring(0, 15) + "..." : fname;
          return "Image " + (imgCount++);
        }
        if (o.type === "rect") return "Rectangle";
        if (o.type === "circle") return "Circle";
        if (o.type === "triangle") return "Triangle";
        if (o.type === "ellipse") return "Ellipse";
        if (o.type === "line") return "Line";
        if (o.type === "polygon") return "Polygon";
        if (o.type === "polyline") return "Polyline";
        if (o.type === "path") return o.name || "Path";
        if (o.type === "group") return "Group (" + (o._objects?.length || 0) + ")";
        return o.name || o.type || "Object";
      })(),'''

if old_name in src:
    # Add imgCount before the map
    src = src.replace(
        'const list = objs.map((o: any, i: number) => ({',
        'let imgCount = 1;\n    const list = objs.map((o: any, i: number) => ({'
    )
    src = src.replace(old_name, new_name)
    print('Fix1: Improved layer naming')
else:
    print('Name pattern not found')

# Also improve the type badge and add icon
old_type = '''<span className="text-[10px] text-gray-400">{layer.type}</span>'''
new_type = '''<span className={	ext-[10px] px-1 py-0.5 rounded }>{
                      layer.type === "image" ? "IMG" :
                      layer.type === "i-text" || layer.type === "text" || layer.type === "textbox" ? "TXT" :
                      layer.type === "path" ? "PATH" :
                      layer.type === "polygon" ? "POLY" :
                      layer.type === "rect" ? "RECT" :
                      layer.type === "circle" ? "CIR" :
                      layer.type === "triangle" ? "TRI" :
                      layer.type === "ellipse" ? "ELL" :
                      layer.type === "group" ? "GRP" :
                      layer.type === "line" ? "LINE" :
                      layer.type?.toUpperCase()?.substring(0, 4) || "OBJ"
                    }</span>'''

if old_type in src:
    src = src.replace(old_type, new_type)
    print('Fix2: Improved type badge with colors')
else:
    print('Type badge not found')

# Add thumbnail preview for images in layer list
old_layer_name = '''<span className="flex-1 truncate text-gray-700">{layer.name}</span>'''
new_layer_name = '''<div className="flex-1 flex items-center gap-1.5 min-w-0">
                      {layer.thumb && <img src={layer.thumb} className="w-6 h-6 rounded object-cover border border-gray-200 flex-shrink-0" />}
                      <span className="truncate text-gray-700">{layer.name}</span>
                    </div>'''

if old_layer_name in src:
    src = src.replace(old_layer_name, new_layer_name)
    print('Fix3: Added thumbnail in layer list')
else:
    print('Layer name span not found')

# Add thumb to layer data
old_locked = '''locked: !!o.lockMovementX,'''
new_locked = '''locked: !!o.lockMovementX,
      thumb: o.type === "image" ? (o._element?.src || o.toDataURL?.({multiplier: 0.1}) || "") : "",'''

if old_locked in src:
    src = src.replace(old_locked, new_locked)
    print('Fix4: Added thumb data')
else:
    print('locked pattern not found')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
