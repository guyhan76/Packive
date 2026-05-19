with open('next.config.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Turbopack이 기본이면 webpack으로 전환
if 'experimental' not in content:
    new_content = content.replace(
        'const nextConfig: NextConfig = {',
        'const nextConfig: NextConfig = {\n  experimental: {\n    turbo: undefined,\n  },'
    )
else:
    new_content = content

with open('next.config.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(new_content)
print('next.config.ts updated')
print(new_content)
