with open('public/symbols/21_recycle2.svg', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the old fill-based border path
old_border = """    <path class="s21_recycle2_c1" d="M6.18,0C2.88-.02.19,2.44.17,5.47L0,44.49c-.01,3.03,2.66,5.51,5.96,5.52l38.98.17c3.27.01,5.95-2.44,5.96-5.47l.17-39.02c.01-3.03-2.64-5.51-5.91-5.52L6.18,0ZM2.19,44.5l.17-39.02c0-1.82,1.71-3.3,3.8-3.29l38.98.17c2.07,0,3.74,1.5,3.73,3.33l-.17,39.02c0,1.82-1.69,3.3-3.76,3.29l-38.98-.17c-2.09,0-3.78-1.5-3.77-3.33Z"/>"""

if old_border in content:
    content = content.replace(old_border, '')
    with open('public/symbols/21_recycle2.svg', 'w', encoding='utf-8') as f:
        f.write(content)
    print("FIXED: removed old fill border from 21_recycle2.svg")
else:
    print("NOT FOUND")
