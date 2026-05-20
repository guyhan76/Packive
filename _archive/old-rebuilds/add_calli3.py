with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Find where Google Fonts are fetched and add calligraphy/handwriting fetch
# Add calliFonts state
old_state = 'const [jaFonts, setJaFonts] = useState<string[]>([]);'
if 'calliFonts' not in src:
    src = src.replace(old_state, old_state + '\n  const [calliFonts, setCalliFonts] = useState<string[]>([]);')
    print('Added calliFonts state')

# Find the useEffect where fonts are fetched (where googleapis.com/webfonts is called)
# Add a fetch for handwriting + display category fonts
fetch_anchor = 'fetch("https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAx3bN9fSS61y6FKewBaDZ4azs6W4XFnPk&sort=popularity")'
if fetch_anchor in src:
    idx = src.index(fetch_anchor)
    # Find the end of the useEffect block to add our fetch
    # Look for the key variable
    key_str = 'const key="AIzaSyAx3bN9fSS61y6FKewBaDZ4azs6W4XFnPk"'
    if key_str not in src:
        key_str = 'key=AIzaSyAx3bN9fSS61y6FKewBaDZ4azs6W4XFnPk'
    
    # Find after japanese fetch to add calligraphy fetch
    ja_fetch = 'subset=japanese&sort=popularity'
    if ja_fetch in src:
        ja_idx = src.index(ja_fetch)
        # Find the line end after japanese fetch handling
        # Look for the next .then or closing of the fetch chain
        # Add calligraphy fetch after japanese section
        
        # Find the line with setJaFonts
        ja_set_idx = src.index('setJaFonts', ja_idx)
        line_end = src.index('\n', ja_set_idx)
        
        calli_fetch = '''
    // Fetch handwriting/display fonts for Calli tab
    fetch("https://www.googleapis.com/webfonts/v1/webfonts?key="+key+"&category=handwriting&sort=popularity")
      .then(r=>r.json()).then(d=>{
        const hw = (d.items||[]).map((f:any)=>f.family).slice(0,80);
        fetch("https://www.googleapis.com/webfonts/v1/webfonts?key="+key+"&category=display&sort=popularity")
          .then(r=>r.json()).then(d2=>{
            const disp = (d2.items||[]).map((f:any)=>f.family).slice(0,40);
            setCalliFonts([...new Set([...hw,...disp])]);
          }).catch(()=>{});
      }).catch(()=>{});'''
        
        src = src[:line_end+1] + calli_fetch + src[line_end+1:]
        print('Added calligraphy font fetch')

# Update the calli font pool to use calliFonts state
old_calli_pool = 'else if (fontCategory === "calli") pool = ["Great Vibes","Dancing Script","Pacifico","Caveat","Sacramento","Satisfy","Kaushan Script","Cookie","Courgette","Lobster","Yellowtail","Tangerine","Allura","Alex Brush","Rochester","Pinyon Script","Italianno","Nanum Pen Script","Gaegu","Hi Melody","Stylish","East Sea Dokdo","Cute Font","Gamja Flower","Poor Story","Yeon Sung","Single Day","Song Myung","Do Hyeon"];'
new_calli_pool = 'else if (fontCategory === "calli") pool = calliFonts.length > 0 ? calliFonts : ["Great Vibes","Dancing Script","Pacifico","Caveat","Sacramento","Satisfy","Kaushan Script","Cookie","Courgette","Lobster","Yellowtail","Tangerine","Allura","Alex Brush","Rochester","Pinyon Script","Italianno","Nanum Pen Script","Gaegu","Hi Melody","Stylish","East Sea Dokdo","Cute Font","Gamja Flower","Poor Story","Yeon Sung","Single Day","Song Myung","Do Hyeon"];'
if old_calli_pool in src:
    src = src.replace(old_calli_pool, new_calli_pool)
    print('Updated calli pool to use calliFonts state')

# Also update the second location (list)
old_calli_list = 'if (fontCategory === "calli") list = ["Great Vibes","Dancing Script","Pacifico","Caveat","Sacramento","Satisfy","Kaushan Script","Cookie","Courgette","Lobster","Yellowtail","Tangerine","Allura","Alex Brush","Rochester","Pinyon Script","Italianno","Nanum Pen Script","Gaegu","Hi Melody","Stylish","East Sea Dokdo","Cute Font","Gamja Flower","Poor Story","Yeon Sung","Single Day","Song Myung","Do Hyeon"];'
new_calli_list = 'if (fontCategory === "calli") list = calliFonts.length > 0 ? calliFonts : ["Great Vibes","Dancing Script","Pacifico","Caveat","Sacramento","Satisfy","Kaushan Script","Cookie","Courgette","Lobster","Yellowtail","Tangerine","Allura","Alex Brush","Rochester","Pinyon Script","Italianno","Nanum Pen Script","Gaegu","Hi Melody","Stylish","East Sea Dokdo","Cute Font","Gamja Flower","Poor Story","Yeon Sung","Single Day","Song Myung","Do Hyeon"];'
if old_calli_list in src:
    src = src.replace(old_calli_list, new_calli_list)
    print('Updated calli list to use calliFonts state')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
