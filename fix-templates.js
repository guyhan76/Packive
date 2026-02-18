const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
console.log("Start:", lines.length);

// ═══ STEP 1: Remove AI Inspire states ═══
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes("AI Inspire states") || 
      lines[i].includes("inspirePrompt") && lines[i].includes("useState") ||
      lines[i].includes("inspireImage") && lines[i].includes("useState") ||
      lines[i].includes("inspireLoading") && lines[i].includes("useState")) {
    console.log("Removed state at line", i + 1);
    lines.splice(i, 1);
  }
}

// ═══ STEP 2: Remove handleAiInspire callback ═══
let code = lines.join("\n"); lines = code.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const handleAiInspire = useCallback")) {
    let end = i;
    for (let j = i; j < i + 10; j++) {
      if (lines[j] && lines[j].includes("], [inspirePrompt")) { end = j; break; }
    }
    console.log("Removed handleAiInspire:", i + 1, "-", end + 1);
    lines.splice(i, end - i + 1);
    break;
  }
}

// ═══ STEP 3: Remove applyInspireToCanvas callback ═══
code = lines.join("\n"); lines = code.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const applyInspireToCanvas = useCallback")) {
    let end = i;
    for (let j = i; j < i + 10; j++) {
      if (lines[j] && lines[j].includes("], [inspireImage")) { end = j; break; }
    }
    console.log("Removed applyInspireToCanvas:", i + 1, "-", end + 1);
    lines.splice(i, end - i + 1);
    break;
  }
}

// ═══ STEP 4: Remove AI Inspire JSX block ═══
code = lines.join("\n"); lines = code.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("AI Inspire")) {
    // Find the containing div
    let start = i;
    if (lines[i - 1] && (lines[i - 1].trim().startsWith("{/*") || lines[i - 1].trim().startsWith("<div"))) start = i - 1;
    // Find end of this section
    let end = i;
    for (let j = i; j < i + 15; j++) {
      if (lines[j] && lines[j].includes("applyInspire")) { end = j; }
    }
    // Find closing divs
    for (let j = end; j < end + 5; j++) {
      if (lines[j] && (lines[j].trim() === "</div>" || lines[j].trim() === "</div>}")) { end = j; break; }
    }
    console.log("Removed AI Inspire JSX:", start + 1, "-", end + 1);
    lines.splice(start, end - start + 1);
    break;
  }
}

// ═══ STEP 5: Add more templates ═══
code = lines.join("\n"); lines = code.split("\n");
// Find the last template closing (before the array close)
let lastTemplateEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "];" && i > 100 && i < 700) {
    lastTemplateEnd = i;
    break;
  }
}
if (lastTemplateEnd === -1) {
  console.log("ERROR: template array end not found");
  process.exit(1);
}
console.log("Template array ends at line", lastTemplateEnd + 1);

const newTemplates = `    // ── Kids ──
    {
      id: 'kids-playful',
      name: 'Playful Kids',
      category: 'Kids',
      preview: 'linear-gradient(135deg, #42a5f5 0%, #ab47bc 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#42a5f5', selectable: false, evented: false });
        const wave = new F.Rect({ left: 0, top: h * 0.6, originX: 'left', originY: 'top', width: w, height: h * 0.4, fill: '#ab47bc', rx: 30, ry: 30 });
        const star = new F.IText('⭐', { left: w * 0.15, top: h * 0.12, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1) });
        const star2 = new F.IText('⭐', { left: w * 0.85, top: h * 0.08, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07) });
        const brand = new F.IText('FUN SNACKS', { left: w / 2, top: h * 0.3, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Yummy Cookies', { left: w / 2, top: h * 0.48, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#fff9c4', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const desc = new F.IText('🍪 Chocolate Chip · 150g', { left: w / 2, top: h * 0.75, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.035), fill: '#ffffff', fontFamily: 'Arial, sans-serif' });
        return [bg, wave, star, star2, brand, product, desc];
      },
    },
    {
      id: 'kids-rainbow',
      name: 'Rainbow Joy',
      category: 'Kids',
      preview: 'linear-gradient(135deg, #ff9800 0%, #f44336 50%, #9c27b0 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fff3e0', selectable: false, evented: false });
        const stripe1 = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.04, fill: '#f44336' });
        const stripe2 = new F.Rect({ left: 0, top: h * 0.04, originX: 'left', originY: 'top', width: w, height: h * 0.04, fill: '#ff9800' });
        const stripe3 = new F.Rect({ left: 0, top: h * 0.08, originX: 'left', originY: 'top', width: w, height: h * 0.04, fill: '#ffeb3b' });
        const emoji = new F.IText('🌈', { left: w / 2, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12) });
        const brand = new F.IText('RAINBOW', { left: w / 2, top: h * 0.42, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.09), fill: '#e91e63', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Fruit Gummies', { left: w / 2, top: h * 0.58, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.055), fill: '#4a148c', fontFamily: 'Arial, sans-serif' });
        const badge = new F.IText('No Artificial Colors!', { left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#ff6f00', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        return [bg, stripe1, stripe2, stripe3, emoji, brand, product, badge];
      },
    },
    // ── Food ──
    {
      id: 'food-warm',
      name: 'Warm Bakery',
      category: 'Food',
      preview: 'linear-gradient(135deg, #5d4037 0%, #8d6e63 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#5d4037', selectable: false, evented: false });
        const banner = new F.Rect({ left: w * 0.08, top: h * 0.15, originX: 'left', originY: 'top', width: w * 0.84, height: h * 0.35, fill: '#f5e6d0', rx: 8, ry: 8 });
        const brand = new F.IText('ARTISAN BAKE', { left: w / 2, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#3e2723', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const divider = new F.Rect({ left: w * 0.25, top: h * 0.32, originX: 'left', originY: 'top', width: w * 0.5, height: 1.5, fill: '#8d6e63' });
        const product = new F.IText('Sourdough Bread', { left: w / 2, top: h * 0.4, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#5d4037', fontFamily: 'Georgia, serif' });
        const icon = new F.IText('🍞', { left: w / 2, top: h * 0.6, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1) });
        const weight = new F.IText('Freshly Baked · 500g', { left: w / 2, top: h * 0.82, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#d7ccc8', fontFamily: 'Arial, sans-serif' });
        return [bg, banner, brand, divider, product, icon, weight];
      },
    },
    {
      id: 'food-fresh',
      name: 'Fresh Market',
      category: 'Food',
      preview: 'linear-gradient(135deg, #ffffff 0%, #c8e6c9 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#ffffff', selectable: false, evented: false });
        const topBar = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.15, fill: '#43a047' });
        const brand = new F.IText('FRESH', { left: w / 2, top: h * 0.075, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Organic Salad Mix', { left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.065), fill: '#2e7d32', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const leaf = new F.IText('🥗', { left: w / 2, top: h * 0.55, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12) });
        const badge = new F.IText('FARM TO TABLE', { left: w / 2, top: h * 0.73, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.035), fill: '#66bb6a', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const weight = new F.IText('Net Wt. 200g · Keep Refrigerated', { left: w / 2, top: h * 0.88, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#9e9e9e', fontFamily: 'Arial, sans-serif' });
        return [bg, topBar, brand, product, leaf, badge, weight];
      },
    },
    // ── Luxury ──
    {
      id: 'luxury-marble',
      name: 'Marble Luxe',
      category: 'Luxury',
      preview: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 50%, #bdbdbd 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#f5f5f5', selectable: false, evented: false });
        const goldLine1 = new F.Rect({ left: w * 0.08, top: h * 0.08, originX: 'left', originY: 'top', width: w * 0.84, height: 1, fill: '#c8a84e' });
        const goldLine2 = new F.Rect({ left: w * 0.08, top: h * 0.92, originX: 'left', originY: 'top', width: w * 0.84, height: 1, fill: '#c8a84e' });
        const brand = new F.IText('MAISON', { left: w / 2, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#c8a84e', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 400 });
        const product = new F.IText('Eau de Parfum', { left: w / 2, top: h * 0.42, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07), fill: '#212121', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
        const vol = new F.IText('50ml · 1.7 fl oz', { left: w / 2, top: h * 0.58, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#9e9e9e', fontFamily: 'Arial, sans-serif' });
        const diamond = new F.IText('◇', { left: w / 2, top: h * 0.75, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#c8a84e' });
        return [bg, goldLine1, goldLine2, brand, product, vol, diamond];
      },
    },
    // ── Beauty ──
    {
      id: 'beauty-floral',
      name: 'Floral Beauty',
      category: 'Beauty',
      preview: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fce4ec', selectable: false, evented: false });
        const flower1 = new F.IText('🌸', { left: w * 0.2, top: h * 0.15, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08) });
        const flower2 = new F.IText('🌺', { left: w * 0.8, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06) });
        const flower3 = new F.IText('🌷', { left: w * 0.15, top: h * 0.8, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07) });
        const brand = new F.IText('BLOOM', { left: w / 2, top: h * 0.3, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#ad1457', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const line = new F.Rect({ left: w * 0.3, top: h * 0.4, originX: 'left', originY: 'top', width: w * 0.4, height: 1, fill: '#e91e63' });
        const product = new F.IText('Body Lotion', { left: w / 2, top: h * 0.5, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#880e4f', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
        const desc = new F.IText('Rose & Jasmine · 200ml', { left: w / 2, top: h * 0.64, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#c2185b', fontFamily: 'Arial, sans-serif' });
        return [bg, flower1, flower2, flower3, brand, line, product, desc];
      },
    },
    // ── Animal ──
    {
      id: 'animal-pet',
      name: 'Pet Care',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #fff8e1 0%, #ffe082 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fff8e1', selectable: false, evented: false });
        const topBand = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.12, fill: '#f57f17' });
        const paw = new F.IText('🐾', { left: w / 2, top: h * 0.06, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06) });
        const brand = new F.IText('HAPPY PAWS', { left: w / 2, top: h * 0.28, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.065), fill: '#e65100', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const pet = new F.IText('🐕', { left: w / 2, top: h * 0.48, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.15) });
        const product = new F.IText('Premium Dog Food', { left: w / 2, top: h * 0.68, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#bf360c', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const desc = new F.IText('Chicken & Rice · 2kg', { left: w / 2, top: h * 0.82, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#8d6e63', fontFamily: 'Arial, sans-serif' });
        return [bg, topBand, paw, brand, pet, product, desc];
      },
    },
    {
      id: 'animal-cat',
      name: 'Cat Lover',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #e8eaf6 0%, #9fa8da 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#e8eaf6', selectable: false, evented: false });
        const circle = new F.Circle({ left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', radius: Math.min(w, h) * 0.18, fill: '#ffffff', stroke: '#5c6bc0', strokeWidth: 2 });
        const cat = new F.IText('🐱', { left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12) });
        const brand = new F.IText('WHISKERS', { left: w / 2, top: h * 0.62, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#283593', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Gourmet Cat Treats', { left: w / 2, top: h * 0.75, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#5c6bc0', fontFamily: 'Georgia, serif' });
        const desc = new F.IText('Salmon Flavor · 100g', { left: w / 2, top: h * 0.87, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.028), fill: '#9e9e9e', fontFamily: 'Arial, sans-serif' });
        return [bg, circle, cat, brand, product, desc];
      },
    },
    // ── Modern ──
    {
      id: 'modern-split',
      name: 'Split Modern',
      category: 'Modern',
      preview: 'linear-gradient(135deg, #263238 0%, #263238 50%, #ff7043 50%, #ff7043 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bgLeft = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w / 2, height: h, fill: '#263238', selectable: false, evented: false });
        const bgRight = new F.Rect({ left: w / 2, top: 0, originX: 'left', originY: 'top', width: w / 2, height: h, fill: '#ff7043', selectable: false, evented: false });
        const brand = new F.IText('STUDIO', { left: w * 0.25, top: h * 0.3, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.055), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 300 });
        const product = new F.IText('Coffee\\nBeans', { left: w * 0.75, top: h * 0.4, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07), fill: '#ffffff', fontFamily: 'Georgia, serif', fontWeight: 'bold', textAlign: 'center' });
        const desc = new F.IText('Single Origin', { left: w * 0.25, top: h * 0.5, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#90a4ae', fontFamily: 'Arial, sans-serif' });
        const weight = new F.IText('250g', { left: w * 0.75, top: h * 0.65, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#ffccbc', fontFamily: 'Arial, sans-serif' });
        return [bgLeft, bgRight, brand, product, desc, weight];
      },
    },
    // ── Bold ──
    {
      id: 'bold-neon',
      name: 'Neon Bold',
      category: 'Bold',
      preview: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#0a0a1a', selectable: false, evented: false });
        const glow1 = new F.Rect({ left: w * 0.05, top: h * 0.2, originX: 'left', originY: 'top', width: w * 0.9, height: 2, fill: '#00ffff' });
        const glow2 = new F.Rect({ left: w * 0.05, top: h * 0.75, originX: 'left', originY: 'top', width: w * 0.9, height: 2, fill: '#ff00ff' });
        const brand = new F.IText('NEON', { left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1), fill: '#00ffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Energy Drink', { left: w / 2, top: h * 0.52, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#ff00ff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const desc = new F.IText('ZERO SUGAR · 355ml', { left: w / 2, top: h * 0.65, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#666688', fontFamily: 'Arial, sans-serif' });
        const bolt = new F.IText('⚡', { left: w / 2, top: h * 0.88, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08) });
        return [bg, glow1, glow2, brand, product, desc, bolt];
      },
    },
    // ── Organic ──
    {
      id: 'organic-honey',
      name: 'Honey Gold',
      category: 'Organic',
      preview: 'linear-gradient(135deg, #fff8e1 0%, #ffca28 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fff8e1', selectable: false, evented: false });
        const hex = new F.IText('⬡', { left: w * 0.3, top: h * 0.15, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#ffca28' });
        const hex2 = new F.IText('⬡', { left: w * 0.7, top: h * 0.12, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#ffe082' });
        const bee = new F.IText('🐝', { left: w / 2, top: h * 0.28, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1) });
        const brand = new F.IText('GOLDEN HIVE', { left: w / 2, top: h * 0.45, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#f57f17', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const product = new F.IText('Raw Honey', { left: w / 2, top: h * 0.6, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#795548', fontFamily: 'Georgia, serif' });
        const desc = new F.IText('Pure · Unfiltered · 340g', { left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.028), fill: '#a1887f', fontFamily: 'Arial, sans-serif' });
        return [bg, hex, hex2, bee, brand, product, desc];
      },
    },`;

lines.splice(lastTemplateEnd, 0, ...newTemplates.split("\n"));
console.log("Added 11 new templates before line", lastTemplateEnd + 1);

code = lines.join("\n");
lines = code.split("\n");
const ob = (code.match(/\{/g) || []).length;
const cb = (code.match(/\}/g) || []).length;
console.log("Done! Lines:", lines.length, "| { :", ob, "| } :", cb, "| diff:", ob - cb);
fs.writeFileSync(file, code, "utf8");
