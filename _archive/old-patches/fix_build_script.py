import json
with open('package.json', 'r', encoding='utf-8') as f:
    pkg = json.load(f)
pkg['scripts']['build'] = 'next build --webpack'
with open('package.json', 'w', encoding='utf-8', newline='\n') as f:
    json.dump(pkg, f, indent=2, ensure_ascii=False)
    f.write('\n')
print('package.json updated: build -> next build --webpack')
print('scripts:', json.dumps(pkg['scripts'], indent=2))
