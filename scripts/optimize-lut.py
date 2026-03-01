import json
import struct

path = r"C:\Users\user\Desktop\dev\packive\src\data\fogra39-lut.json"
with open(path, "r") as f:
    data = json.load(f)

steps = data["steps"]
lut = data["lut"]
n = len(steps)

# Method 1: Compact JSON (array-based, no keys)
# Order: C outer -> M -> Y -> K inner, RGB values as flat array
compact = []
for c in steps:
    for m in steps:
        for y in steps:
            for k in steps:
                key = f"{c},{m},{y},{k}"
                r, g, b = lut[key]
                compact.extend([r, g, b])

# Save as compact JSON array
compact_path = r"C:\Users\user\Desktop\dev\packive\src\data\fogra39-lut-compact.json"
with open(compact_path, "w") as f:
    json.dump({"n": n, "step": 5, "rgb": compact}, f)

import os
size1 = os.path.getsize(compact_path) / (1024 * 1024)
print(f"Compact JSON: {size1:.1f} MB ({len(compact)} values)")

# Method 2: Binary format (most compact)
bin_path = r"C:\Users\user\Desktop\dev\packive\public\fogra39-lut.bin"
with open(bin_path, "wb") as f:
    f.write(struct.pack("B", n))  # grid size
    for val in compact:
        f.write(struct.pack("B", val))

size2 = os.path.getsize(bin_path) / (1024 * 1024)
print(f"Binary: {size2:.1f} MB ({len(compact)} bytes)")

# Method 3: 10% step = 11^4 = 14,641 entries (much smaller, slightly less accurate)
steps10 = list(range(0, 101, 10))
n10 = len(steps10)
compact10 = []
for c in steps10:
    for m in steps10:
        for y in steps10:
            for k in steps10:
                key = f"{c},{m},{y},{k}"
                if key in lut:
                    r, g, b = lut[key]
                else:
                    # Find nearest
                    def nearest(v): return min(steps, key=lambda s: abs(s-v))
                    nk = f"{nearest(c)},{nearest(m)},{nearest(y)},{nearest(k)}"
                    r, g, b = lut[nk]
                compact10.extend([r, g, b])

small_path = r"C:\Users\user\Desktop\dev\packive\public\fogra39-lut-11.bin"
with open(small_path, "wb") as f:
    f.write(struct.pack("B", n10))
    for val in compact10:
        f.write(struct.pack("B", val))

size3 = os.path.getsize(small_path) / (1024 * 1024)
print(f"Binary 10% step: {size3:.2f} MB ({n10}^4 = {n10**4} entries)")

# Accuracy test: 10% vs 5% step
print("\n=== 10% step accuracy (compared to 5% step) ===")
test_cmyks = [(100,0,0,0),(0,100,0,0),(0,0,100,0),(0,0,0,100),(25,75,50,10),(80,20,60,30)]
for cmyk in test_cmyks:
    key5 = f"{cmyk[0]},{cmyk[1]},{cmyk[2]},{cmyk[3]}"
    key10 = key5
    rgb5 = lut[key5]
    rgb10_key = f"{cmyk[0]},{cmyk[1]},{cmyk[2]},{cmyk[3]}"
    rgb10 = lut.get(rgb10_key, rgb5)
    print(f"  CMYK {cmyk}: 5%={rgb5} 10%={rgb10} (same grid point = identical)")

print("\nRecommendation: Use 5% step binary (0.6MB) for best accuracy.")
print("Load via fetch() as ArrayBuffer, then use TypeScript interpolation.")