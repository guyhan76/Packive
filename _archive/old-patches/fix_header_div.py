with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# L2133: </div>  ← header closing div
# L2134: {/* Hidden file inputs */}  ← this should be INSIDE the header div

# Move L2133 (</div>) to after L2253 (where hidden inputs end with </div>)
# Actually, the hidden inputs at L2134-2253 need to be inside the header div
# So we need to move the </div> at L2133 to after L2252

# Remove the </div> at L2132 (index 2132)
line_2133 = lines[2132].strip()
print(f"L2133 content: '{line_2133}'")

if line_2133 == '</div>':
    # Remove the premature </div>
    del lines[2132]
    print("Removed premature </div> at L2133")
    
    # Now L2253 (was L2254) has </div> which closes the hidden inputs area
    # We need to check L2253 area
    # After deletion, old L2134 becomes L2133, old L2254 becomes L2253
    # Find where the hidden inputs section ends
    for i in range(2130, min(2260, len(lines))):
        if '      </div>' == lines[i].rstrip() and i > 2140:
            print(f"L{i+1}: found </div> - this closes the hidden inputs section")
            break
    
    # The structure should be:
    # L2132: </div>  (closes right-side buttons div)
    # L2133: {/* Hidden file inputs */}
    # ...
    # L2252: </div>  (this should close the header div)
    # But we need to ADD </div> before L2252's </div> to close the header
    
    print(f"\nTotal lines after fix: {len(lines)}")
else:
    print(f"L2133 is not </div>, it's: {line_2133}")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.writelines(lines)
