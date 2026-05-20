with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

changes = 0

# Fix 1: Add "calli" to both tab arrays
old_tabs = '(["all","en","ko","ja"] as const)'
new_tabs = '(["all","en","ko","ja","calli"] as const)'
count = src.count(old_tabs)
if count > 0:
    src = src.replace(old_tabs, new_tabs)
    changes += count
    print(f'Fix1: Added calli to {count} tab arrays')

# Fix 2: Add Calli label
old_label = 'cat==="all"?"All":cat==="en"?"English":cat==="ko"?"Korean":"Japanese"'
new_label = 'cat==="all"?"All":cat==="en"?"English":cat==="ko"?"Korean":cat==="ja"?"Japanese":"Calli"'
count2 = src.count(old_label)
if count2 > 0:
    src = src.replace(old_label, new_label)
    changes += count2
    print(f'Fix2: Added Calli label in {count2} places')

# Fix 3: Add calligraphy font list to the font pool logic
# Find where en/ko/ja pools are defined and add calli
old_pool = 'else if (fontCategory === "ja") pool = jaFonts.length > 0 ? jaFonts : ["Noto Sans JP","Noto Serif JP","M PLUS Rounded 1c"'
if old_pool in src:
    # Find the full line
    idx = src.index(old_pool)
    end = src.index('\n', idx)
    full_line = src[idx:end]
    calli_pool = full_line + '\n                                        else if (fontCategory === "calli") pool = ["Great Vibes","Dancing Script","Pacifico","Caveat","Sacramento","Satisfy","Kaushan Script","Cookie","Courgette","Lobster","Yellowtail","Tangerine","Allura","Alex Brush","Rochester","Pinyon Script","Italianno","Nanum Pen Script","Gaegu","Hi Melody","Stylish","East Sea Dokdo","Cute Font","Gamja Flower","Poor Story","Yeon Sung","Single Day","Song Myung","Do Hyeon"];'
    src = src.replace(full_line, calli_pool)
    changes += 1
    print('Fix3: Added calli font pool')

# Also add for the other font list location (L3434 area)
old_ja_list = 'if (fontCategory === "ja") list = jaFonts.length > 0 ? jaFonts : ["Noto Sans JP","Noto Serif JP","M PLUS Rounded 1c","M PLU'
if 'fontCategory === "ja") list' in src:
    # Find the line
    idx = src.index('fontCategory === "ja") list')
    end = src.index('\n', idx)
    full_line = src[idx:end]
    calli_list = full_line + '\n                                      if (fontCategory === "calli") list = ["Great Vibes","Dancing Script","Pacifico","Caveat","Sacramento","Satisfy","Kaushan Script","Cookie","Courgette","Lobster","Yellowtail","Tangerine","Allura","Alex Brush","Rochester","Pinyon Script","Italianno","Nanum Pen Script","Gaegu","Hi Melody","Stylish","East Sea Dokdo","Cute Font","Gamja Flower","Poor Story","Yeon Sung","Single Day","Song Myung","Do Hyeon"];'
    src = src.replace(full_line, calli_list)
    changes += 1
    print('Fix4: Added calli list to second location')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total changes: {changes}, Total lines: {len(src.splitlines())}')
