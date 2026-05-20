from PIL import Image
import os

# Convert WebP to PNG
img = Image.open('public/packive-logo.png')
print(f"Original size: {img.size}")
print(f"Mode: {img.mode}")

# Save as proper PNG
img.save('public/packive-logo.png', 'PNG')
print(f"Converted to PNG: {os.path.getsize('public/packive-logo.png')} bytes")

# Verify
img2 = Image.open('public/packive-logo.png')
print(f"Verified size: {img2.size}, format: {img2.format}")
