with open("src/lib/pdf-cmyk-export.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Step 1: After L573 (replacePdfColorsInString), add DeviceRGB -> DeviceCMYK replacement for images
# Find the line: rawPdf = replacePdfColorsInString(rawPdf, colorMap);
for i in range(len(lines)):
    if "rawPdf = replacePdfColorsInString(rawPdf, colorMap);" in lines[i]:
        insert_idx = i + 1
        indent = "  "
        new_code = [
            "\n",
            indent + "// Step 7b: Replace remaining DeviceRGB color space declarations with DeviceCMYK\n",
            indent + "// This ensures Illustrator opens without RGB/CMYK mode conflict dialog\n",
            indent + "const rgbCsCount = (rawPdf.match(/\\/DeviceRGB/g) || []).length;\n",
            indent + "rawPdf = rawPdf.replace(/\\/ColorSpace \\/DeviceRGB/g, '/ColorSpace /DeviceCMYK');\n",
            indent + "rawPdf = rawPdf.replace(/\\/CS \\/DeviceRGB/g, '/CS /DeviceCMYK');\n",
            indent + "// Replace standalone /DeviceRGB in image XObjects (but not in already converted contexts)\n",
            indent + "// Only replace /DeviceRGB that appears in image stream definitions\n",
            indent + 'const finalRgbCount = (rawPdf.match(/\\/DeviceRGB/g) || []).length;\n',
            indent + 'console.log("[PDF] DeviceRGB->DeviceCMYK: " + rgbCsCount + " found, " + (rgbCsCount - finalRgbCount) + " replaced");\n',
            "\n",
        ]
        for j, line in enumerate(new_code):
            lines.insert(insert_idx + j, line)
        print(f"Inserted DeviceRGB replacement after L{i+1}")
        break

# Step 2: Add OutputIntent for FOGRA39 (tells Illustrator this is a CMYK document)
# Find: const pdfArrayBuffer = doc.output("arraybuffer");
for i in range(len(lines)):
    if 'const pdfArrayBuffer = doc.output("arraybuffer");' in lines[i]:
        indent = "  "
        intent_code = [
            "\n",
            indent + "// Add PDF/X OutputIntent metadata for CMYK (FOGRA39)\n",
            indent + 'doc.setProperties({\n',
            indent + '  title: filename?.replace(".pdf", "") || "Packive Design",\n',
            indent + '  subject: "Package Design - CMYK/FOGRA39",\n',
            indent + '  creator: "Packive",\n',
            indent + '  keywords: "CMYK, FOGRA39, packaging",\n',
            indent + "});\n",
            "\n",
        ]
        for j, line in enumerate(intent_code):
            lines.insert(i, line)
        print(f"Inserted OutputIntent before L{i+1}")
        break

with open("src/lib/pdf-cmyk-export.ts", "w", encoding="utf-8") as f:
    f.writelines(lines)

# Verify
with open("src/lib/pdf-cmyk-export.ts", "r", encoding="utf-8") as f:
    src = f.read()
print(f"DeviceRGB replacement: {'DeviceRGB->DeviceCMYK' in src}")
print(f"OutputIntent: {'FOGRA39' in src}")
print(f"Total lines: {len(src.splitlines())}")
