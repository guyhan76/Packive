with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# 1. Add calligraphy font category state
old_cat = '''const [fontCategory, setFontCategory] = useState<"all"|"en"|"ko"|"ja">("all");'''
new_cat = '''const [fontCategory, setFontCategory] = useState<"all"|"en"|"ko"|"ja"|"calli">("all");'''
if old_cat in src:
    src = src.replace(old_cat, new_cat)
    print('Fix1: Added calli category state')

# 2. Add calligraphy font lists after jaFonts state
old_ja = '''const [jaFonts, setJaFonts] = useState<string[]>([]);'''
new_ja = '''const [jaFonts, setJaFonts] = useState<string[]>([]);
  const calliEn = ["Great Vibes","Dancing Script","Pacifico","Satisfy","Sacramento","Allura","Alex Brush","Tangerine","Pinyon Script","Petit Formal Script","Marck Script","Arizonia","Lovers Quarrel","Romanesco","Monsieur La Doulaise","Mr De Haviland","Herr Von Muellerhoff","Dr Sugiyama","Miss Fajardose","Seaweed Script","Lavishly Yours","Fleur De Leah","Luxurious Script","Meow Script"];
  const calliKo = ["Nanum Pen Script","Nanum Brush Script","Gaegu","Gamja Flower","Hi Melody","Dokdo","East Sea Dokdo","Song Myung","Poor Story","Yeon Sung","Stylish","Sunflower","Single Day","Jua","Cute Font"];'''
if old_ja in src:
    src = src.replace(old_ja, new_ja)
    print('Fix2: Added calligraphy font lists')

# 3. Update font category tabs to include calli
old_tabs = '''{(["all","en","ko","ja"] as const).map(cat => ('''
new_tabs = '''{(["all","en","ko","ja","calli"] as const).map(cat => ('''
src = src.replace(old_tabs, new_tabs)
print(f'Fix3: Updated font tabs ({src.count("calli] as const")} places)')

# 4. Update tab labels
old_label = '''cat==="all"?"All":cat==="en"?"English":cat==="ko"?"Korean":"Japanese"'''
new_label = '''cat==="all"?"All":cat==="en"?"English":cat==="ko"?"Korean":cat==="ja"?"Japanese":"Calli"'''
if old_label in src:
    src = src.replace(old_label, new_label)
    print('Fix4: Updated tab labels')

# Also check for Korean labels
old_label_kr = '''cat==="all"?"All":cat==="en"?"English":cat==="ko"?"\ud55c\uad6d\uc5b4":cat==="ja"?" \u65e5\u672c\u8a9e":cat'''
# Try simpler approach - find the tab label rendering
for pattern in [
    'cat==="all"?"All":cat==="en"?"English":cat==="ko"?"한국어":cat==="ja"?" 日本語":cat',
]:
    if pattern in src:
        src = src.replace(pattern, pattern.replace(':cat', ':cat==="calli"?"Calli":cat'))
        print('Fix4b: Updated Korean tab labels')

# 5. Add calli filter in font selector dropdown
old_pool = '''else if (fontCategory === "ko") pool = koFonts.length > 0 ? koFonts'''
new_pool = '''else if (fontCategory === "calli") pool = [...calliEn, ...calliKo];
                                       else if (fontCategory === "ko") pool = koFonts.length > 0 ? koFonts'''
if old_pool in src:
    src = src.replace(old_pool, new_pool)
    print('Fix5: Added calli filter in font dropdown')

# 6. Also update table font selector if it has the same pattern
old_pool2 = '''if (fontCategory === "ko") list = koFonts.length > 0 ? koFonts'''
new_pool2 = '''if (fontCategory === "calli") list = [...calliEn, ...calliKo];
                                     if (fontCategory === "ko") list = koFonts.length > 0 ? koFonts'''
if old_pool2 in src:
    src = src.replace(old_pool2, new_pool2, 1)
    print('Fix6: Added calli filter in table font dropdown')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
