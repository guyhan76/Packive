for fn in ['6_fire1.svg', '21_recycle2.svg']:
    with open(f'public/symbols/{fn}', 'r', encoding='utf-8') as f:
        content = f.read()
    print(f"=== {fn} ({len(content)} bytes) ===")
    print(content[:2000])
    print()
