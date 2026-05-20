files = ['1_glass.svg', '4_nife1.svg', '9_up.svg']
for fn in files:
    with open(f'public/symbols/{fn}', 'r', encoding='utf-8') as f:
        content = f.read()
    print(f"=== {fn} ({len(content)} bytes) ===")
    print(content[:1500])
    print()
