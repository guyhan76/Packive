import os, re

# These 4 files have fill-based borders at ~3.36px thickness in 53x50 viewBox
# After scale(3.4), border appears as ~11.4px vs other symbols ~9.2px
# Solution: replace the thick border polygon with a thinner stroke-based rect

files_to_fix = {
    '1_glass.svg': {
        'old': '<path class="s1_glass_c1" d="M0,0v50.47h53.01V0H0ZM3.36,3.36h46.3v43.76H3.36V3.36Z"/>',
        'new': '<rect x="1.5" y="1.5" width="50.01" height="47.47" fill="none" stroke="#231815" stroke-width="3"/>'
    },
    '2_umbreller1.svg': {
        'old': '<polygon class="s2_umbreller1_c1" points="51.33 48.79 51.33 47.11 3.36 47.11 3.36 3.36 49.65 3.36 49.65 48.79 51.33 48.79 51.33 47.11 51.33 48.79 53.01 48.79 53.01 0 0 0 0 50.47 53.01 50.47 53.01 48.79 51.33 48.79"/>',
        'new': '<rect x="1.5" y="1.5" width="50.01" height="47.47" fill="none" stroke="#231815" stroke-width="3"/>'
    },
    '4_nife1.svg': {
        'old': '<polygon points="0 0 0 50.47 53.01 50.47 53.01 48.79 51.33 48.79 49.65 48.79 49.65 47.11 3.36 47.11 3.36 3.36 49.65 3.36 49.65 47.11 51.33 47.11 51.33 48.79 53.01 48.79 53.01 0 0 0"/>',
        'new': '<rect x="1.5" y="1.5" width="50.01" height="47.47" fill="none" stroke="#231815" stroke-width="3"/>'
    },
    '9_up.svg': {
        'old': '<polygon class="s9_up_c1" points="51.33 48.79 51.33 47.11 3.36 47.11 3.36 3.36 49.66 3.36 49.66 48.79 51.33 48.79 51.33 47.11 51.33 48.79 53.01 48.79 53.01 0 0 0 0 50.47 53.01 50.47 53.01 48.79 51.33 48.79"/>',
        'new': '<rect x="1.5" y="1.5" width="50.01" height="47.47" fill="none" stroke="#231815" stroke-width="3"/>'
    }
}

fixed = 0
for fn, rep in files_to_fix.items():
    fp = os.path.join('public/symbols', fn)
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    if rep['old'] in content:
        content = content.replace(rep['old'], rep['new'])
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        fixed += 1
        print(f"FIXED: {fn} - replaced fill border with stroke rect")
    else:
        print(f"NOT FOUND: {fn}")

print(f"\nTotal fixed: {fixed}")
