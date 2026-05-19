import subprocess, os

# First, let's check the actual file type
with open('public/packive-logo.png', 'rb') as f:
    header = f.read(16)
print(f"Raw header: {header[:16].hex()}")
print(f"ASCII: {header[:8]}")

# RIFF header = WebP or BMP
if header[:4] == b'RIFF' and header[8:12] == b'WEBP':
    print("File is actually a WebP image")
    ext = 'webp'
elif header[:2] == b'BM':
    print("File is actually a BMP image")
    ext = 'bmp'
elif header[:4] == b'RIFF':
    print("File is RIFF container (likely WebP)")
    ext = 'webp'
elif header[:8] == b'\x89PNG\r\n\x1a\n':
    print("File is already PNG")
    ext = 'png'
else:
    print(f"Unknown format: {header[:4]}")
    ext = 'unknown'

print(f"Detected format: {ext}")
print(f"File size: {os.path.getsize('public/packive-logo.png')} bytes")
