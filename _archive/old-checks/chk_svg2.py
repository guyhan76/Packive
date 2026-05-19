# Check the problematic SVGs
for fname in ["3_nife6.svg", "7_shoes2.svg"]:
    with open(f"public/symbols/{fname}", "r", encoding="utf-8") as f:
        content = f.read()
    print(f"\n=== {fname} ({len(content)} bytes) ===")
    print(content[:800])
