import json

path = r"C:\Users\user\Desktop\dev\packive\src\data\fogra39-lut.json"
with open(path, "r") as f:
    data = json.load(f)

steps = data["steps"]
lut = data["lut"]

print(f"Steps: {steps}")
print(f"Total entries: {len(lut)}")

# 핵심 CMYK 색상 검증
tests = {
    "Pure Cyan (100,0,0,0)": "100,0,0,0",
    "Pure Magenta (0,100,0,0)": "0,100,0,0",
    "Pure Yellow (0,0,100,0)": "0,0,100,0",
    "Pure Black (0,0,0,100)": "0,0,0,100",
    "White (0,0,0,0)": "0,0,0,0",
    "Rich Black (60,40,40,100)": "60,40,40,100",
    "Red (0,100,100,0)": "0,100,100,0",
    "Green (100,0,100,0)": "100,0,100,0",
    "Blue (100,100,0,0)": "100,100,0,0",
    "CMYK mid (50,50,50,50)": "50,50,50,50",
}

print("\n=== FOGRA39 Soft Proofing Results ===")
print(f"{'Color':<30} {'CMYK':<20} {'sRGB':<15} {'HEX'}")
print("-" * 80)
for name, key in tests.items():
    rgb = lut[key]
    hex_val = "#{:02X}{:02X}{:02X}".format(*rgb)
    print(f"{name:<30} {key:<20} {str(rgb):<15} {hex_val}")

# 단순 수학 변환과 비교
print("\n=== ICC vs Simple Math Comparison ===")
print(f"{'CMYK':<20} {'ICC sRGB':<15} {'Simple sRGB':<15} {'Difference'}")
print("-" * 65)
for name, key in tests.items():
    c,m,y,k = [int(x) for x in key.split(",")]
    icc_rgb = lut[key]
    # Simple math conversion
    r = int(255 * (1-c/100) * (1-k/100))
    g = int(255 * (1-m/100) * (1-k/100))
    b = int(255 * (1-y/100) * (1-k/100))
    simple = [r, g, b]
    diff = sum(abs(a-b) for a,b in zip(icc_rgb, simple))
    print(f"{key:<20} {str(icc_rgb):<15} {str(simple):<15} {diff}")