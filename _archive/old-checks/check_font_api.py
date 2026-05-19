import os

# Find the google-font-css API route
for root, dirs, files in os.walk('src/app/api'):
    for f in files:
        if 'font' in f.lower() or 'google' in f.lower():
            path = os.path.join(root, f)
            print(f'=== {path} ===')
            with open(path, 'r', encoding='utf-8') as fp:
                for i, line in enumerate(fp.readlines()):
                    print(f'L{i+1}: {line.rstrip()[:180]}')
            print()
