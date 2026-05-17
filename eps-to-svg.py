#!/usr/bin/env python3
"""
EPS to SVG converter for Packive
Usage: python eps-to-svg.py input.eps output.svg
"""
import sys
import os
import re
import subprocess
import tempfile

def eps_to_svg_basic(eps_path, svg_path):
    """Basic EPS to SVG conversion by parsing EPS paths"""
    with open(eps_path, 'r', errors='ignore') as f:
        content = f.read()
    
    # Extract BoundingBox
    bb_match = re.search(r'%%BoundingBox:\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)', content)
    if bb_match:
        x1, y1, x2, y2 = map(float, bb_match.groups())
        width = x2 - x1
        height = y2 - y1
    else:
        width, height = 800, 600
        x1, y1 = 0, 0
    
    # Start building SVG
    svg_lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x1} {y1} {width} {height}" width="{width}" height="{height}">',
        f'  <g transform="translate(0,{height}) scale(1,-1)">'  # Flip Y axis (PS is bottom-up)
    ]
    
    # Parse PostScript paths
    current_path = []
    current_x, current_y = 0.0, 0.0
    stroke_color = "#000000"
    stroke_width = "1"
    paths_found = 0
    
    # Simple PS tokenizer
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if not line or line.startswith('%'):
            continue
        
        tokens = line.split()
        i = 0
        while i < len(tokens):
            tok = tokens[i]
            
            # setrgbcolor
            if tok == 'setrgbcolor' and i >= 3:
                try:
                    r = float(tokens[i-3])
                    g = float(tokens[i-2])
                    b = float(tokens[i-1])
                    stroke_color = f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"
                except:
                    pass
            
            # setlinewidth
            elif tok == 'setlinewidth' and i >= 1:
                try:
                    stroke_width = tokens[i-1]
                except:
                    pass
            
            # moveto
            elif tok in ('moveto', 'm') and i >= 2:
                try:
                    x, y = float(tokens[i-2]), float(tokens[i-1])
                    current_path.append(f"M {x} {y}")
                    current_x, current_y = x, y
                except:
                    pass
            
            # lineto
            elif tok in ('lineto', 'l') and i >= 2:
                try:
                    x, y = float(tokens[i-2]), float(tokens[i-1])
                    current_path.append(f"L {x} {y}")
                    current_x, current_y = x, y
                except:
                    pass
            
            # curveto
            elif tok in ('curveto', 'c') and i >= 6:
                try:
                    x1c = float(tokens[i-6])
                    y1c = float(tokens[i-5])
                    x2c = float(tokens[i-4])
                    y2c = float(tokens[i-3])
                    x3 = float(tokens[i-2])
                    y3 = float(tokens[i-1])
                    current_path.append(f"C {x1c} {y1c} {x2c} {y2c} {x3} {y3}")
                    current_x, current_y = x3, y3
                except:
                    pass
            
            # closepath
            elif tok in ('closepath', 'cp', 'h'):
                current_path.append("Z")
            
            # stroke
            elif tok == 'stroke':
                if current_path:
                    d = " ".join(current_path)
                    svg_lines.append(f'    <path d="{d}" fill="none" stroke="{stroke_color}" stroke-width="{stroke_width}"/>')
                    paths_found += 1
                    current_path = []
            
            # fill
            elif tok == 'fill':
                if current_path:
                    d = " ".join(current_path)
                    svg_lines.append(f'    <path d="{d}" fill="{stroke_color}" stroke="none"/>')
                    paths_found += 1
                    current_path = []
            
            # newpath
            elif tok == 'newpath':
                current_path = []
            
            i += 1
    
    # Flush remaining path
    if current_path:
        d = " ".join(current_path)
        svg_lines.append(f'    <path d="{d}" fill="none" stroke="{stroke_color}" stroke-width="{stroke_width}"/>')
        paths_found += 1
    
    svg_lines.append('  </g>')
    svg_lines.append('</svg>')
    
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(svg_lines))
    
    print(f"Converted: {paths_found} paths extracted")
    print(f"Size: {width:.1f} x {height:.1f}")
    print(f"Output: {svg_path}")
    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python eps-to-svg.py input.eps [output.svg]")
        sys.exit(1)
    
    eps_path = sys.argv[1]
    if not os.path.exists(eps_path):
        print(f"Error: File not found: {eps_path}")
        sys.exit(1)
    
    if len(sys.argv) >= 3:
        svg_path = sys.argv[2]
    else:
        svg_path = os.path.splitext(eps_path)[0] + ".svg"
    
    print(f"Converting {eps_path} -> {svg_path}")
    eps_to_svg_basic(eps_path, svg_path)

if __name__ == "__main__":
    main()
