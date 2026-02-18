const fs = require("fs");
const file = "src/lib/openai.ts";
let code = fs.readFileSync(file, "utf8");

// Replace the system prompt for generate design
const oldPrompt = code.indexOf("Create a flat packaging design layout for a");
const promptEnd = code.indexOf("Style: Professional product packaging");
if (oldPrompt === -1) { console.log("ERROR: prompt not found"); process.exit(1); }

// Find the full template string from backtick to backtick
const lines = code.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const systemPrompt = ")) {
    // Replace entire systemPrompt line
    lines[i] = "  const systemPrompt = `Design a single flat rectangular graphic for the ${boxType} panel of a product box. This is ONLY the ${boxType} face (${dimensions.L}x${dimensions.D}mm). DO NOT draw a 3D box or unfolded box template. DO NOT show multiple panels or fold lines. Create ONLY a single flat rectangle design that fills the entire image. Design concept: ${prompt}. Requirements: Clean professional product packaging design, suitable for print at 300DPI, vibrant CMYK-safe colors, include brand name placeholder, product info area, and decorative elements. The design should look like a finished single-panel artwork ready to be placed on one face of a box.`";
    console.log("Prompt replaced at line", i + 1);
    break;
  }
}

code = lines.join("\n");
fs.writeFileSync(file, code, "utf8");
console.log("Done!");
