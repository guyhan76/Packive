import json, os
from PIL import Image, ImageCms

# Load ICC profiles
cmyk_profile = ImageCms.getOpenProfile(r"C:\Windows\System32\spool\drivers\color\CoatedFOGRA39.icc")
srgb_profile = ImageCms.createProfile("sRGB")

# sRGB -> CMYK transform
transform_to_cmyk = ImageCms.buildTransform(
    srgb_profile, cmyk_profile, "RGB", "CMYK",
    renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC
)

# Build reverse LUT: for each sRGB (step 4), get CMYK
# 256/4 = 64 steps per channel, 64^3 = 262144 entries
# Store as binary: R,G,B -> C,M,Y,K (4 bytes each)
STEP = 4
grid = 256 // STEP  # 64
total = grid * grid * grid  # 262144

print(f"Generating reverse LUT: {grid}^3 = {total} entries")

data = bytearray(total * 4)  # C,M,Y,K per entry
idx = 0

for ri in range(grid):
    r = ri * STEP
    if ri == grid - 1: r = 255
    for gi in range(grid):
        g = gi * STEP
        if gi == grid - 1: g = 255
        for bi in range(grid):
            b = bi * STEP
            if bi == grid - 1: b = 255
            
            img = Image.new("RGB", (1, 1), (r, g, b))
            cmyk_img = ImageCms.applyTransform(img, transform_to_cmyk)
            c_val, m_val, y_val, k_val = cmyk_img.getpixel((0, 0))
            
            # Pillow CMYK values are 0-255, convert to 0-100
            c_pct = round(c_val / 255 * 100)
            m_pct = round(m_val / 255 * 100)
            y_pct = round(y_val / 255 * 100)
            k_pct = round(k_val / 255 * 100)
            
            data[idx] = c_pct
            data[idx+1] = m_pct
            data[idx+2] = y_pct
            data[idx+3] = k_pct
            idx += 4
    
    if ri % 8 == 0:
        print(f"  Progress: {ri}/{grid} ({ri*100//grid}%)")

# Save binary
out_path = r"C:\Users\user\Desktop\dev\packive\public\fogra39-reverse-lut.bin"
with open(out_path, "wb") as f:
    f.write(data)

size_kb = os.path.getsize(out_path) / 1024
print(f"\nDone! {out_path}")
print(f"Size: {size_kb:.1f} KB ({total} entries x 4 bytes)")

# Verify with test colors
test_colors = [
    ("Pure Red", 255, 0, 0),
    ("Pure Green", 0, 255, 0),
    ("Pure Blue", 0, 0, 255),
    ("Yellow", 255, 255, 0),
    ("Cyan", 0, 255, 255),
    ("Magenta", 255, 0, 255),
    ("White", 255, 255, 255),
    ("Black", 0, 0, 0),
    ("Mid Gray", 128, 128, 128),
    ("Orange", 255, 165, 0),
]

print("\n=== Verification: sRGB -> CMYK (FOGRA39) ===")
for name, r, g, b in test_colors:
    img = Image.new("RGB", (1, 1), (r, g, b))
    cmyk_img = ImageCms.applyTransform(img, transform_to_cmyk)
    c_val, m_val, y_val, k_val = cmyk_img.getpixel((0, 0))
    c_pct = round(c_val / 255 * 100)
    m_pct = round(m_val / 255 * 100)
    y_pct = round(y_val / 255 * 100)
    k_pct = round(k_val / 255 * 100)
    print(f"  {name}: RGB({r},{g},{b}) -> CMYK({c_pct},{m_pct},{y_pct},{k_pct})")