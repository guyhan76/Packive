with open('src/app/api/google-font-css/route.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# IE8 UA returns EOT format, not TTF
# Safari 5 UA returns TTF format from Google Fonts
old_ua = '"User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)"'
new_ua = '"User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/531.22.7 (KHTML, like Gecko) Version/5.0 Safari/531.22.7"'

if old_ua in src:
    src = src.replace(old_ua, new_ua)
    print('Fix1: UA changed from IE8 to Safari 5 (TTF)')
else:
    print('UA not found - checking content')
    print(repr(src[src.find('User-Agent'):src.find('User-Agent')+100]))

with open('src/app/api/google-font-css/route.ts', 'w', encoding='utf-8') as f:
    f.write(src)

# Verify
with open('src/app/api/google-font-css/route.ts', 'r', encoding='utf-8') as f:
    v = f.read()
print(f'Has Safari UA: {"Safari/531" in v}')
print(f'Has IE8 UA: {"MSIE 8.0" in v}')
