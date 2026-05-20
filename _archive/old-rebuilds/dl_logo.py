import urllib.request
import os

# Download logo
url = "https://www.genspark.ai/api/files/s/aAGnaik2"
dest = "public/packive-logo.png"
try:
    urllib.request.urlretrieve(url, dest)
    size = os.path.getsize(dest)
    print(f"Downloaded: {dest} ({size} bytes)")
except Exception as e:
    print(f"Download failed: {e}")
