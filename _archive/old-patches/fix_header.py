with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Find the patch building area - the issue is in how newData is constructed
# Current: newHeader (without >>) + stream marker + cmyk data
# Missing: >> between header dict and stream keyword
# Also missing: endstream after data

old_header_build = '''const newHeader = header.substring(0, header.indexOf("stream"))
      .replace("/ColorSpace /DeviceRGB", "/ColorSpace /DeviceCMYK")
      .replace("/Length " + dataLen, "/Length " + cmykLen);
    
    // Encode new header as bytes
    const headerBytes = new Uint8Array(newHeader.length);
    for (let i = 0; i < newHeader.length; i++) headerBytes[i] = newHeader.charCodeAt(i);
    
    // stream marker
    const sm = (s1 >= 0 && s1 < dictStart + headerLen) ? new Uint8Array([0x73,0x74,0x72,0x65,0x61,0x6D,0x0D,0x0A]) : new Uint8Array([0x73,0x74,0x72,0x65,0x61,0x6D,0x0A]);
    
    // Combine: newHeader + stream\\n + cmykData
    const patch = new Uint8Array(headerBytes.length + sm.length + cmykBuf.length);
    patch.set(headerBytes, 0);
    patch.set(sm, headerBytes.length);
    patch.set(cmykBuf, headerBytes.length + sm.length);'''

new_header_build = '''// Keep everything from dictStart up to and including "stream\\n"
    // Just replace DeviceRGB->DeviceCMYK and Length in the original header bytes
    const origHeaderLen = streamStart - dictStart; // includes << ... >> stream\\n
    let headerStr = extractStr(buf, dictStart, origHeaderLen);
    headerStr = headerStr
      .replace("/ColorSpace /DeviceRGB", "/ColorSpace /DeviceCMYK")
      .replace("/Length " + dataLen, "/Length " + cmykLen);
    
    const headerBytes = new Uint8Array(origHeaderLen);
    for (let i = 0; i < origHeaderLen; i++) headerBytes[i] = headerStr.charCodeAt(i);
    
    // Combine: fixed header (includes >>stream\\n) + cmykData
    const patch = new Uint8Array(headerBytes.length + cmykBuf.length);
    patch.set(headerBytes, 0);
    patch.set(cmykBuf, headerBytes.length);'''

if old_header_build in src:
    src = src.replace(old_header_build, new_header_build)
    print('Fix1: Header construction fixed')
else:
    print('ERROR: old header build not found')
    # Show what we have
    idx = src.find('const newHeader = header.substring')
    if idx > 0:
        print(repr(src[idx:idx+600]))

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)

print(f'Total lines: {len(src.splitlines())}')
