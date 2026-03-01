import json
import struct
from PIL import ImageCms

# ICC profiles
cmyk_profile = ImageCms.getOpenProfile(r"C:\Windows\System32\spool\drivers\color\CoatedFOGRA39.icc")
srgb_profile = ImageCms.createProfile("sRGB")

# Create transform: CMYK -> sRGB
transform = ImageCms.buildTransform(cmyk_profile, srgb_profile, "CMYK", "RGB")

# Generate LUT: CMYK each 5% step = 0,5,10,...,100 = 21 values per channel
# Total: 21^4 = 194,481 entries
steps = list(range(0, 101, 5))  # [0, 5, 10, ..., 100]
n = len(steps)

print(f"Generating LUT: {n}x{n}x{n}x{n} = {n**4} entries...")

lut = {}
count = 0
for ci, c in enumerate(steps):
    for mi, m in enumerate(steps):
        for yi, y in enumerate(steps):
            for ki, k in enumerate(steps):
                # CMYK values as 0-255 range for PIL
                c255 = int(c * 2.55)
                m255 = int(m * 2.55)
                y255 = int(y * 2.55)
                k255 = int(k * 2.55)
                
                # Create 1x1 CMYK image
                from PIL import Image
                img = Image.new("CMYK", (1, 1), (c255, m255, y255, k255))
                
                # Transform to sRGB
                rgb_img = ImageCms.applyTransform(img, transform)
                r, g, b = rgb_img.getpixel((0, 0))
                
                # Store as compact key
                key = f"{c},{m},{y},{k}"
                lut[key] = [r, g, b]
                
                count += 1
                if count % 10000 == 0:
                    print(f"  {count}/{n**4} ({count*100//(n**4)}%)")

print(f"Done! {count} entries generated.")

# Save as JSON
output_path = r"C:\Users\user\Desktop\dev\packive\src\data\fogra39-lut.json"
with open(output_path, "w") as f:
    json.dump({"steps": steps, "lut": lut}, f)

import os
size_mb = os.path.getsize(output_path) / (1024 * 1024)
print(f"Saved: {output_path} ({size_mb:.1f} MB)")