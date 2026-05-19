with open('public/packive-logo.png','rb') as f:
    data = f.read(30)
    print(f"File size: {len(open('public/packive-logo.png','rb').read())} bytes")
    print(f"Header bytes: {data[:8].hex()}")
    # PNG signature: 89504e470d0a1a0a
    # IHDR chunk starts at byte 8
    import struct
    # Skip 8-byte signature + 4-byte chunk length + 4-byte chunk type = 16 bytes
    w = struct.unpack('>I', data[16:20])[0]
    h = struct.unpack('>I', data[20:24])[0]
    print(f"Image dimensions: {w} x {h} px")
