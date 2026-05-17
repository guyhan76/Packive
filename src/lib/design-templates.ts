// ═══════════════════════════════════════════════════════════════════════════════
// design-templates.ts v3 — 2026 Trend-Based Premium Templates for Packive
// Inspired by: Ultra-Clean Industrial, Apothecary Aesthetic, Narrative Pop,
//   Soft Neutrals, Nature Greens, Warm Earth Tones, Modern Blues
// Font strategy: Google Fonts (Montserrat, Playfair Display, Cormorant Garamond,
//   Inter, Lora, DM Serif Display) — fallback to system fonts
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Types ───────────────────────────────────────────────────────────────────
export interface TemplateObject {
  type: "textbox" | "rect" | "circle" | "ellipse" | "line" | "path";
  offsetX: number; // mm from template top-left
  offsetY: number;
  width?: number;  // mm
  height?: number;
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  // Text props
  text?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  fontStyle?: string;
  textAlign?: string;
  lineHeight?: number;
  charSpacing?: number;
  underline?: boolean;
  // Path/Line
  path?: string;
  x1?: number; y1?: number; x2?: number; y2?: number;
  // Metadata
  _role?: "bg" | "accent" | "text" | "decoration" | "placeholder";
  _label?: string;
  editable?: boolean;
  selectable?: boolean;
  rx?: number;
  ry?: number;
}

export interface DesignTemplate {
  id: string;
  name: string;
  nameKo?: string;
  category: string;
  subcategory?: string;
  description?: string;
  descriptionKo?: string;
  colors: string[];
  fonts: string[];
  templateW: number; // mm
  templateH: number;
  objects: TemplateObject[];
}

// ─── Categories ──────────────────────────────────────────────────────────────
export const DESIGN_CATEGORIES = [
  { id: "all", label: "All", labelKo: "전체" },
  { id: "minimal", label: "Minimal", labelKo: "미니멀" },
  { id: "luxury", label: "Luxury", labelKo: "럭셔리" },
  { id: "natural", label: "Natural", labelKo: "내추럴" },
  { id: "bold", label: "Bold", labelKo: "볼드" },
  { id: "info", label: "Info", labelKo: "정보" },
  { id: "deco", label: "Deco", labelKo: "장식" },
];

// ─── Color Palettes (2026 Trends) ────────────────────────────────────────────
const P = {
  // Ultra-Clean Industrial
  industrial: { bg: "#F5F3F0", text: "#1A1A1A", sub: "#6B6B6B", accent: "#C8C2B8", line: "#D4CFC7" },
  // Soft Neutrals
  neutral: { bg: "#FAF8F5", text: "#2C2C2C", sub: "#8A8580", accent: "#D4B896", line: "#E8E2DA" },
  // Nature-Inspired
  botanical: { bg: "#F2F5ED", text: "#1E3322", sub: "#4A6B50", accent: "#8CAF88", line: "#C5D4BF" },
  // Warm Earth
  earth: { bg: "#F8F1E8", text: "#3D2B1F", sub: "#7A5C44", accent: "#C8956C", line: "#E2D2BF" },
  // Modern Blue
  azure: { bg: "#F0F4F8", text: "#1B2A3D", sub: "#5A7A9B", accent: "#7DABC7", line: "#C8D8E8" },
  // Deep Luxury
  noir: { bg: "#1A1A1A", text: "#F5F0E8", sub: "#B8A88A", accent: "#D4AF37", line: "#3A3A3A" },
  // Blush Premium
  blush: { bg: "#FBF5F3", text: "#3D2B2B", sub: "#9E7B7B", accent: "#D4A0A0", line: "#EAD8D4" },
  // Sage Modern
  sage: { bg: "#F5F7F2", text: "#2A3328", sub: "#6B7A65", accent: "#98AB8E", line: "#D0D9CA" },
};

// ─── Font Stacks ─────────────────────────────────────────────────────────────
const F = {
  display:   "'Playfair Display', 'Georgia', serif",
  elegant:   "'Cormorant Garamond', 'Garamond', serif",
  heading:   "'Montserrat', 'Helvetica Neue', sans-serif",
  body:      "'Inter', 'Helvetica', sans-serif",
  editorial: "'DM Serif Display', 'Georgia', serif",
  classic:   "'Lora', 'Georgia', serif",
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

export const DESIGN_TEMPLATES: DesignTemplate[] = [

  // ──────────────────────────────────────────────────────────────────────────
  // 1. ULTRA-CLEAN MINIMAL (Industrial trend)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "minimal-ultra-clean",
    name: "Ultra Clean",
    nameKo: "울트라 클린",
    category: "minimal",
    subcategory: "Industrial",
    description: "Dieter Rams-inspired minimal layout with geometric precision",
    colors: [P.industrial.bg, P.industrial.text, P.industrial.sub, P.industrial.accent],
    fonts: [F.heading, F.body],
    templateW: 180,
    templateH: 260,
    objects: [
      // Background
      { type: "rect", offsetX: 0, offsetY: 0, width: 180, height: 260, fill: P.industrial.bg, _role: "bg", _label: "Background", selectable: true },
      // Top thin line
      { type: "line", offsetX: 16, offsetY: 28, x1: 0, y1: 0, x2: 148, y2: 0, stroke: P.industrial.text, strokeWidth: 0.4, _role: "decoration" },
      // Brand name — uppercase, tracked
      { type: "textbox", offsetX: 16, offsetY: 34, width: 148, text: "BRAND NAME", fontSize: 9, fontFamily: F.heading, fontWeight: "500", fill: P.industrial.sub, textAlign: "left", charSpacing: 400, _role: "text", _label: "Brand", editable: true },
      // Product title — large, bold
      { type: "textbox", offsetX: 16, offsetY: 58, width: 148, text: "Product\nTitle", fontSize: 32, fontFamily: F.heading, fontWeight: "700", fill: P.industrial.text, textAlign: "left", lineHeight: 1.05, _role: "text", _label: "Product Name", editable: true },
      // Subtle divider
      { type: "rect", offsetX: 16, offsetY: 118, width: 24, height: 1, fill: P.industrial.accent, _role: "decoration" },
      // Description
      { type: "textbox", offsetX: 16, offsetY: 128, width: 110, text: "A clean, minimal description of your product. Highlight key features and ingredients.", fontSize: 8, fontFamily: F.body, fontWeight: "400", fill: P.industrial.sub, textAlign: "left", lineHeight: 1.6, _role: "text", _label: "Description", editable: true },
      // Volume/Weight
      { type: "textbox", offsetX: 16, offsetY: 210, width: 60, text: "250 ml", fontSize: 11, fontFamily: F.heading, fontWeight: "300", fill: P.industrial.sub, textAlign: "left", charSpacing: 200, _role: "text", _label: "Volume", editable: true },
      // Bottom line
      { type: "line", offsetX: 16, offsetY: 238, x1: 0, y1: 0, x2: 148, y2: 0, stroke: P.industrial.text, strokeWidth: 0.4, _role: "decoration" },
      // Footer
      { type: "textbox", offsetX: 16, offsetY: 242, width: 148, text: "www.yourbrand.com", fontSize: 7, fontFamily: F.body, fontWeight: "400", fill: P.industrial.sub, textAlign: "left", charSpacing: 100, _role: "text", _label: "Website", editable: true },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. SOFT NEUTRAL SERIF (Neutral trend + Playfair)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "minimal-soft-serif",
    name: "Soft Serif",
    nameKo: "소프트 세리프",
    category: "minimal",
    subcategory: "Neutral Serif",
    description: "Warm neutral tones with elegant Playfair Display headlines",
    colors: [P.neutral.bg, P.neutral.text, P.neutral.sub, P.neutral.accent],
    fonts: [F.display, F.body],
    templateW: 180,
    templateH: 260,
    objects: [
      { type: "rect", offsetX: 0, offsetY: 0, width: 180, height: 260, fill: P.neutral.bg, _role: "bg", _label: "Background", selectable: true },
      // Centered brand
      { type: "textbox", offsetX: 16, offsetY: 32, width: 148, text: "MAISON", fontSize: 8, fontFamily: F.heading, fontWeight: "500", fill: P.neutral.sub, textAlign: "center", charSpacing: 600, _role: "text", _label: "Brand", editable: true },
      // Elegant divider
      { type: "rect", offsetX: 82, offsetY: 47, width: 16, height: 0.5, fill: P.neutral.accent, _role: "decoration" },
      // Serif title
      { type: "textbox", offsetX: 16, offsetY: 60, width: 148, text: "Gentle\nRadiance", fontSize: 30, fontFamily: F.display, fontWeight: "400", fill: P.neutral.text, textAlign: "center", lineHeight: 1.15, fontStyle: "italic", _role: "text", _label: "Product Name", editable: true },
      // Subtitle
      { type: "textbox", offsetX: 16, offsetY: 118, width: 148, text: "Hydrating Facial Cream", fontSize: 9, fontFamily: F.body, fontWeight: "400", fill: P.neutral.sub, textAlign: "center", charSpacing: 200, _role: "text", _label: "Subtitle", editable: true },
      // Center accent line
      { type: "rect", offsetX: 70, offsetY: 140, width: 40, height: 0.5, fill: P.neutral.accent, _role: "decoration" },
      // Body text
      { type: "textbox", offsetX: 28, offsetY: 152, width: 124, text: "Enriched with natural botanicals and nourishing oils to reveal your skin's natural luminosity.", fontSize: 7.5, fontFamily: F.body, fontWeight: "400", fill: P.neutral.sub, textAlign: "center", lineHeight: 1.7, _role: "text", _label: "Description", editable: true },
      // Volume
      { type: "textbox", offsetX: 16, offsetY: 210, width: 148, text: "50 ml / 1.7 fl oz", fontSize: 8, fontFamily: F.body, fontWeight: "300", fill: P.neutral.sub, textAlign: "center", _role: "text", _label: "Volume", editable: true },
      // Bottom accent
      { type: "rect", offsetX: 82, offsetY: 232, width: 16, height: 0.5, fill: P.neutral.accent, _role: "decoration" },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. NOIR LUXURY (Deep luxury + Gold accents)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "luxury-noir-gold",
    name: "Noir & Gold",
    nameKo: "누아르 골드",
    category: "luxury",
    subcategory: "Dark Luxury",
    description: "Deep black background with gold accents and Cormorant Garamond",
    colors: [P.noir.bg, P.noir.text, P.noir.sub, P.noir.accent],
    fonts: [F.elegant, F.heading],
    templateW: 180,
    templateH: 260,
    objects: [
      { type: "rect", offsetX: 0, offsetY: 0, width: 180, height: 260, fill: P.noir.bg, _role: "bg", _label: "Background", selectable: true },
      // Gold top border
      { type: "rect", offsetX: 12, offsetY: 12, width: 156, height: 236, fill: "transparent", stroke: P.noir.accent, strokeWidth: 0.3, _role: "decoration", _label: "Border" },
      // Brand
      { type: "textbox", offsetX: 20, offsetY: 28, width: 140, text: "ATELIER", fontSize: 8, fontFamily: F.heading, fontWeight: "400", fill: P.noir.accent, textAlign: "center", charSpacing: 800, _role: "text", _label: "Brand", editable: true },
      // Gold divider
      { type: "rect", offsetX: 78, offsetY: 44, width: 24, height: 0.4, fill: P.noir.accent, _role: "decoration" },
      // Title in Cormorant
      { type: "textbox", offsetX: 20, offsetY: 56, width: 140, text: "Midnight\nElixir", fontSize: 34, fontFamily: F.elegant, fontWeight: "300", fill: P.noir.text, textAlign: "center", lineHeight: 1.1, _role: "text", _label: "Product Name", editable: true },
      // Subtitle
      { type: "textbox", offsetX: 20, offsetY: 120, width: 140, text: "Premium Night Serum", fontSize: 9, fontFamily: F.heading, fontWeight: "300", fill: P.noir.sub, textAlign: "center", charSpacing: 300, _role: "text", _label: "Subtitle", editable: true },
      // Small diamond accent
      { type: "textbox", offsetX: 20, offsetY: 144, width: 140, text: "◆", fontSize: 6, fontFamily: F.body, fill: P.noir.accent, textAlign: "center", _role: "decoration" },
      // Description
      { type: "textbox", offsetX: 30, offsetY: 158, width: 120, text: "A luxurious blend of rare botanical extracts designed to rejuvenate while you sleep.", fontSize: 7.5, fontFamily: F.body, fontWeight: "300", fill: P.noir.sub, textAlign: "center", lineHeight: 1.7, _role: "text", _label: "Description", editable: true },
      // Volume
      { type: "textbox", offsetX: 20, offsetY: 215, width: 140, text: "30 ml", fontSize: 10, fontFamily: F.heading, fontWeight: "300", fill: P.noir.text, textAlign: "center", charSpacing: 200, _role: "text", _label: "Volume", editable: true },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. BLUSH PREMIUM (Blush palette + Feminine luxury)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "luxury-blush",
    name: "Blush Petal",
    nameKo: "블러쉬 페탈",
    category: "luxury",
    subcategory: "Feminine Premium",
    description: "Soft blush tones with refined serif typography",
    colors: [P.blush.bg, P.blush.text, P.blush.sub, P.blush.accent],
    fonts: [F.display, F.body],
    templateW: 180,
    templateH: 260,
    objects: [
      { type: "rect", offsetX: 0, offsetY: 0, width: 180, height: 260, fill: P.blush.bg, _role: "bg", _label: "Background", selectable: true },
      // Top accent bar
      { type: "rect", offsetX: 70, offsetY: 22, width: 40, height: 2, fill: P.blush.accent, rx: 1, ry: 1, _role: "decoration" },
      // Brand
      { type: "textbox", offsetX: 16, offsetY: 36, width: 148, text: "ROSÉ BEAUTY", fontSize: 7.5, fontFamily: F.heading, fontWeight: "500", fill: P.blush.sub, textAlign: "center", charSpacing: 500, _role: "text", _label: "Brand", editable: true },
      // Title
      { type: "textbox", offsetX: 16, offsetY: 62, width: 148, text: "Velvet\nBloom", fontSize: 32, fontFamily: F.display, fontWeight: "400", fill: P.blush.text, textAlign: "center", lineHeight: 1.1, _role: "text", _label: "Product Name", editable: true },
      // Category
      { type: "textbox", offsetX: 16, offsetY: 124, width: 148, text: "Nourishing Lip Treatment", fontSize: 8.5, fontFamily: F.body, fontWeight: "400", fill: P.blush.sub, textAlign: "center", charSpacing: 150, _role: "text", _label: "Category", editable: true },
      // Decorative dots
      { type: "textbox", offsetX: 16, offsetY: 146, width: 148, text: "· · ·", fontSize: 10, fontFamily: F.body, fill: P.blush.accent, textAlign: "center", charSpacing: 300, _role: "decoration" },
      // Description
      { type: "textbox", offsetX: 30, offsetY: 162, width: 120, text: "Infused with rose hip oil and vitamin E for deeply moisturized, beautifully tinted lips.", fontSize: 7.5, fontFamily: F.body, fontWeight: "400", fill: P.blush.sub, textAlign: "center", lineHeight: 1.7, _role: "text", _label: "Description", editable: true },
      // Volume
      { type: "textbox", offsetX: 16, offsetY: 215, width: 148, text: "15 ml", fontSize: 9, fontFamily: F.heading, fontWeight: "300", fill: P.blush.text, textAlign: "center", _role: "text", _label: "Volume", editable: true },
      // Bottom accent bar
      { type: "rect", offsetX: 70, offsetY: 240, width: 40, height: 2, fill: P.blush.accent, rx: 1, ry: 1, _role: "decoration" },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. BOTANICAL GREEN (Nature trend)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "natural-botanical",
    name: "Botanical",
    nameKo: "보타니컬",
    category: "natural",
    subcategory: "Organic",
    description: "Nature-inspired greens with botanical elegance",
    colors: [P.botanical.bg, P.botanical.text, P.botanical.sub, P.botanical.accent],
    fonts: [F.classic, F.body],
    templateW: 180,
    templateH: 260,
    objects: [
      { type: "rect", offsetX: 0, offsetY: 0, width: 180, height: 260, fill: P.botanical.bg, _role: "bg", _label: "Background", selectable: true },
      // Leaf-like top accent
      { type: "circle", offsetX: 90, offsetY: 24, radius: 3, fill: "transparent", stroke: P.botanical.accent, strokeWidth: 0.5, _role: "decoration" },
      // Brand
      { type: "textbox", offsetX: 16, offsetY: 38, width: 148, text: "TERRA VERDE", fontSize: 7.5, fontFamily: F.heading, fontWeight: "500", fill: P.botanical.sub, textAlign: "center", charSpacing: 500, _role: "text", _label: "Brand", editable: true },
      // Title in Lora
      { type: "textbox", offsetX: 16, offsetY: 58, width: 148, text: "Morning\nDew", fontSize: 30, fontFamily: F.classic, fontWeight: "400", fill: P.botanical.text, textAlign: "center", lineHeight: 1.15, fontStyle: "italic", _role: "text", _label: "Product Name", editable: true },
      // Subtitle
      { type: "textbox", offsetX: 16, offsetY: 116, width: 148, text: "Organic Face Mist", fontSize: 9, fontFamily: F.body, fontWeight: "400", fill: P.botanical.sub, textAlign: "center", charSpacing: 200, _role: "text", _label: "Subtitle", editable: true },
      // Leaf divider line
      { type: "line", offsetX: 60, offsetY: 136, x1: 0, y1: 0, x2: 60, y2: 0, stroke: P.botanical.accent, strokeWidth: 0.5, _role: "decoration" },
      // Body
      { type: "textbox", offsetX: 28, offsetY: 148, width: 124, text: "Crafted with wild-harvested botanicals and pure spring water from pristine mountain sources.", fontSize: 7.5, fontFamily: F.body, fontWeight: "400", fill: P.botanical.sub, textAlign: "center", lineHeight: 1.7, _role: "text", _label: "Description", editable: true },
      // Certified organic badge area
      { type: "textbox", offsetX: 16, offsetY: 198, width: 148, text: "✦ Certified Organic ✦", fontSize: 7, fontFamily: F.heading, fontWeight: "400", fill: P.botanical.accent, textAlign: "center", charSpacing: 200, _role: "text", _label: "Certification", editable: true },
      // Volume
      { type: "textbox", offsetX: 16, offsetY: 222, width: 148, text: "100 ml / 3.4 fl oz", fontSize: 8, fontFamily: F.body, fontWeight: "300", fill: P.botanical.sub, textAlign: "center", _role: "text", _label: "Volume", editable: true },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. WARM EARTH (Earth tones + Apothecary style)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "natural-earth",
    name: "Earth Apothecary",
    nameKo: "어스 아포테카리",
    category: "natural",
    subcategory: "Artisanal",
    description: "Warm earth tones with apothecary-style structured grid",
    colors: [P.earth.bg, P.earth.text, P.earth.sub, P.earth.accent],
    fonts: [F.editorial, F.body],
    templateW: 180,
    templateH: 260,
    objects: [
      { type: "rect", offsetX: 0, offsetY: 0, width: 180, height: 260, fill: P.earth.bg, _role: "bg", _label: "Background", selectable: true },
      // Double border (apothecary style)
      { type: "rect", offsetX: 10, offsetY: 10, width: 160, height: 240, fill: "transparent", stroke: P.earth.sub, strokeWidth: 0.3, _role: "decoration" },
      { type: "rect", offsetX: 14, offsetY: 14, width: 152, height: 232, fill: "transparent", stroke: P.earth.sub, strokeWidth: 0.15, _role: "decoration" },
      // Brand
      { type: "textbox", offsetX: 20, offsetY: 26, width: 140, text: "EST. 2024", fontSize: 7, fontFamily: F.heading, fontWeight: "400", fill: P.earth.sub, textAlign: "center", charSpacing: 400, _role: "text", _label: "Established", editable: true },
      // Title in DM Serif
      { type: "textbox", offsetX: 20, offsetY: 46, width: 140, text: "Heritage\nRemedy", fontSize: 28, fontFamily: F.editorial, fontWeight: "400", fill: P.earth.text, textAlign: "center", lineHeight: 1.15, _role: "text", _label: "Product Name", editable: true },
      // Horizontal rule
      { type: "line", offsetX: 50, offsetY: 100, x1: 0, y1: 0, x2: 80, y2: 0, stroke: P.earth.accent, strokeWidth: 0.4, _role: "decoration" },
      // Type/Category
      { type: "textbox", offsetX: 20, offsetY: 108, width: 140, text: "Healing Balm", fontSize: 9, fontFamily: F.heading, fontWeight: "400", fill: P.earth.sub, textAlign: "center", charSpacing: 300, _role: "text", _label: "Type", editable: true },
      // Ingredients list (apothecary style)
      { type: "textbox", offsetX: 28, offsetY: 134, width: 124, text: "Beeswax · Shea Butter\nCalendula · Chamomile\nLavender Essential Oil", fontSize: 7.5, fontFamily: F.body, fontWeight: "400", fill: P.earth.sub, textAlign: "center", lineHeight: 1.8, _role: "text", _label: "Ingredients", editable: true },
      // Net weight
      { type: "textbox", offsetX: 20, offsetY: 200, width: 140, text: "NET WT. 60g", fontSize: 8, fontFamily: F.heading, fontWeight: "500", fill: P.earth.text, textAlign: "center", charSpacing: 300, _role: "text", _label: "Weight", editable: true },
      // Maker
      { type: "textbox", offsetX: 20, offsetY: 224, width: 140, text: "Handcrafted in Small Batches", fontSize: 6.5, fontFamily: F.body, fontWeight: "400", fill: P.earth.sub, textAlign: "center", fontStyle: "italic", _role: "text", _label: "Tagline", editable: true },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. AZURE MODERN (Modern blue trend)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "bold-azure",
    name: "Azure Modern",
    nameKo: "애저 모던",
    category: "bold",
    subcategory: "Modern Blue",
    description: "Clean modern design with calming blue accents",
    colors: [P.azure.bg, P.azure.text, P.azure.sub, P.azure.accent],
    fonts: [F.heading, F.body],
    templateW: 180,
    templateH: 260,
    objects: [
      { type: "rect", offsetX: 0, offsetY: 0, width: 180, height: 260, fill: P.azure.bg, _role: "bg", _label: "Background", selectable: true },
      // Blue accent block (top-left)
      { type: "rect", offsetX: 0, offsetY: 0, width: 6, height: 90, fill: P.azure.accent, _role: "accent", _label: "Side Accent" },
      // Brand
      { type: "textbox", offsetX: 20, offsetY: 28, width: 140, text: "AQUA LABS", fontSize: 8, fontFamily: F.heading, fontWeight: "600", fill: P.azure.sub, textAlign: "left", charSpacing: 400, _role: "text", _label: "Brand", editable: true },
      // Title
      { type: "textbox", offsetX: 20, offsetY: 50, width: 140, text: "Clear\nHorizon", fontSize: 34, fontFamily: F.heading, fontWeight: "700", fill: P.azure.text, textAlign: "left", lineHeight: 1.05, _role: "text", _label: "Product Name", editable: true },
      // Accent underline
      { type: "rect", offsetX: 20, offsetY: 114, width: 40, height: 2.5, fill: P.azure.accent, rx: 1.25, ry: 1.25, _role: "accent" },
      // Subtitle
      { type: "textbox", offsetX: 20, offsetY: 126, width: 140, text: "Deep Hydration Serum", fontSize: 9, fontFamily: F.body, fontWeight: "500", fill: P.azure.sub, textAlign: "left", _role: "text", _label: "Subtitle", editable: true },
      // Body
      { type: "textbox", offsetX: 20, offsetY: 148, width: 130, text: "Advanced marine peptides and hyaluronic acid work together to deliver lasting moisture and visible clarity.", fontSize: 7.5, fontFamily: F.body, fontWeight: "400", fill: P.azure.sub, textAlign: "left", lineHeight: 1.7, _role: "text", _label: "Description", editable: true },
      // Stats block
      { type: "textbox", offsetX: 20, offsetY: 206, width: 50, text: "95%", fontSize: 22, fontFamily: F.heading, fontWeight: "700", fill: P.azure.accent, textAlign: "left", _role: "text", _label: "Stat Number", editable: true },
      { type: "textbox", offsetX: 20, offsetY: 226, width: 80, text: "saw visible results\nin 4 weeks", fontSize: 7, fontFamily: F.body, fontWeight: "400", fill: P.azure.sub, textAlign: "left", lineHeight: 1.5, _role: "text", _label: "Stat Detail", editable: true },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. NARRATIVE EDITORIAL (Narrative Pop trend)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "bold-narrative",
    name: "Narrative Pop",
    nameKo: "내러티브 팝",
    category: "bold",
    subcategory: "Editorial",
    description: "Magazine-style editorial layout with bold typography hierarchy",
    colors: [P.industrial.bg, P.industrial.text, "#E84B2F", P.industrial.sub],
    fonts: [F.display, F.heading, F.body],
    templateW: 180,
    templateH: 260,
    objects: [
      { type: "rect", offsetX: 0, offsetY: 0, width: 180, height: 260, fill: "#FAFAF7", _role: "bg", _label: "Background", selectable: true },
      // Large editorial number
      { type: "textbox", offsetX: 12, offsetY: 14, width: 50, text: "No.1", fontSize: 40, fontFamily: F.display, fontWeight: "700", fill: "#E84B2F", textAlign: "left", lineHeight: 0.9, _role: "text", _label: "Edition", editable: true },
      // Title — bold, large
      { type: "textbox", offsetX: 12, offsetY: 65, width: 156, text: "The Art of\nSlow Beauty", fontSize: 26, fontFamily: F.display, fontWeight: "700", fill: P.industrial.text, textAlign: "left", lineHeight: 1.1, _role: "text", _label: "Title", editable: true },
      // Red accent bar
      { type: "rect", offsetX: 12, offsetY: 118, width: 30, height: 2.5, fill: "#E84B2F", _role: "accent" },
      // Byline
      { type: "textbox", offsetX: 12, offsetY: 128, width: 156, text: "BY YOUR BRAND NAME", fontSize: 7, fontFamily: F.heading, fontWeight: "600", fill: P.industrial.sub, textAlign: "left", charSpacing: 400, _role: "text", _label: "Brand", editable: true },
      // Body text (editorial style)
      { type: "textbox", offsetX: 12, offsetY: 148, width: 156, text: "In a world that moves too fast, we chose to slow down. Every ingredient is sourced with intention, every formula crafted with care. This is beauty that takes its time — and it shows.", fontSize: 8, fontFamily: F.body, fontWeight: "400", fill: P.industrial.sub, textAlign: "left", lineHeight: 1.7, _role: "text", _label: "Story", editable: true },
      // Pull quote
      { type: "textbox", offsetX: 12, offsetY: 220, width: 156, text: '"Less, but better."', fontSize: 14, fontFamily: F.display, fontWeight: "400", fill: P.industrial.text, textAlign: "left", fontStyle: "italic", _role: "text", _label: "Quote", editable: true },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. SAGE MINIMAL (Sage modern + clean)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "minimal-sage",
    name: "Sage & Stone",
    nameKo: "세이지 앤 스톤",
    category: "minimal",
    subcategory: "Modern Organic",
    description: "Muted sage tones with airy, spacious layout",
    colors: [P.sage.bg, P.sage.text, P.sage.sub, P.sage.accent],
    fonts: [F.heading, F.body],
    templateW: 180,
    templateH: 260,
    objects: [
      { type: "rect", offsetX: 0, offsetY: 0, width: 180, height: 260, fill: P.sage.bg, _role: "bg", _label: "Background", selectable: true },
      // Minimal top mark
      { type: "rect", offsetX: 87, offsetY: 20, width: 6, height: 6, fill: "transparent", stroke: P.sage.accent, strokeWidth: 0.4, _role: "decoration" },
      // Brand
      { type: "textbox", offsetX: 16, offsetY: 42, width: 148, text: "STONE & LEAF", fontSize: 7, fontFamily: F.heading, fontWeight: "500", fill: P.sage.sub, textAlign: "center", charSpacing: 500, _role: "text", _label: "Brand", editable: true },
      // Product name
      { type: "textbox", offsetX: 16, offsetY: 68, width: 148, text: "Still\nWater", fontSize: 32, fontFamily: F.heading, fontWeight: "300", fill: P.sage.text, textAlign: "center", lineHeight: 1.1, _role: "text", _label: "Product Name", editable: true },
      // Simple line
      { type: "line", offsetX: 75, offsetY: 130, x1: 0, y1: 0, x2: 30, y2: 0, stroke: P.sage.accent, strokeWidth: 0.5, _role: "decoration" },
      // Description
      { type: "textbox", offsetX: 30, offsetY: 144, width: 120, text: "A gentle, grounding body oil infused with sage, cedar, and white tea.", fontSize: 7.5, fontFamily: F.body, fontWeight: "400", fill: P.sage.sub, textAlign: "center", lineHeight: 1.7, _role: "text", _label: "Description", editable: true },
      // Volume
      { type: "textbox", offsetX: 16, offsetY: 218, width: 148, text: "200 ml", fontSize: 9, fontFamily: F.heading, fontWeight: "300", fill: P.sage.sub, textAlign: "center", charSpacing: 200, _role: "text", _label: "Volume", editable: true },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. FOOD LABEL — ARTISANAL
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "natural-artisan-food",
    name: "Artisan Food",
    nameKo: "아티산 푸드",
    category: "natural",
    subcategory: "Food & Beverage",
    description: "Warm, rustic food label with earth-tone palette",
    colors: [P.earth.bg, P.earth.text, P.earth.sub, P.earth.accent],
    fonts: [F.editorial, F.heading, F.body],
    templateW: 200,
    templateH: 120,
    objects: [
      { type: "rect", offsetX: 0, offsetY: 0, width: 200, height: 120, fill: P.earth.bg, _role: "bg", _label: "Background", selectable: true },
      // Left brand block
      { type: "rect", offsetX: 0, offsetY: 0, width: 60, height: 120, fill: P.earth.text, _role: "accent", _label: "Brand Block" },
      { type: "textbox", offsetX: 5, offsetY: 20, width: 50, text: "FARM\nFRESH", fontSize: 14, fontFamily: F.editorial, fontWeight: "400", fill: P.earth.bg, textAlign: "center", lineHeight: 1.2, _role: "text", _label: "Brand", editable: true },
      { type: "textbox", offsetX: 5, offsetY: 58, width: 50, text: "EST. 2024", fontSize: 6, fontFamily: F.heading, fontWeight: "400", fill: P.earth.accent, textAlign: "center", charSpacing: 300, _role: "text", _label: "Year", editable: true },
      // Main content
      { type: "textbox", offsetX: 70, offsetY: 16, width: 120, text: "Wildflower Honey", fontSize: 20, fontFamily: F.editorial, fontWeight: "400", fill: P.earth.text, textAlign: "left", lineHeight: 1.1, _role: "text", _label: "Product Name", editable: true },
      // Divider
      { type: "line", offsetX: 70, offsetY: 48, x1: 0, y1: 0, x2: 80, y2: 0, stroke: P.earth.accent, strokeWidth: 0.4, _role: "decoration" },
      // Description
      { type: "textbox", offsetX: 70, offsetY: 56, width: 120, text: "Raw, unfiltered honey sourced from local wildflower meadows. No additives.", fontSize: 7, fontFamily: F.body, fontWeight: "400", fill: P.earth.sub, textAlign: "left", lineHeight: 1.6, _role: "text", _label: "Description", editable: true },
      // Weight
      { type: "textbox", offsetX: 70, offsetY: 96, width: 60, text: "NET WT. 340g", fontSize: 7, fontFamily: F.heading, fontWeight: "500", fill: P.earth.text, textAlign: "left", charSpacing: 200, _role: "text", _label: "Weight", editable: true },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. INGREDIENTS INFO BLOCK
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "info-ingredients",
    name: "Ingredients",
    nameKo: "성분표",
    category: "info",
    subcategory: "Ingredient List",
    description: "Clean ingredient list block for product backs",
    colors: ["#FFFFFF", "#1A1A1A", "#666666", "#E0E0E0"],
    fonts: [F.heading, F.body],
    templateW: 140,
    templateH: 180,
    objects: [
      { type: "rect", offsetX: 0, offsetY: 0, width: 140, height: 180, fill: "#FFFFFF", _role: "bg", _label: "Background", selectable: true },
      // Header
      { type: "textbox", offsetX: 10, offsetY: 10, width: 120, text: "INGREDIENTS", fontSize: 8, fontFamily: F.heading, fontWeight: "600", fill: "#1A1A1A", textAlign: "left", charSpacing: 400, _role: "text", _label: "Header", editable: true },
      // Line
      { type: "line", offsetX: 10, offsetY: 24, x1: 0, y1: 0, x2: 120, y2: 0, stroke: "#1A1A1A", strokeWidth: 0.5, _role: "decoration" },
      // Ingredient text
      { type: "textbox", offsetX: 10, offsetY: 30, width: 120, text: "Aqua, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Butyrospermum Parkii Butter, Squalane, Sodium Hyaluronate, Tocopherol, Citric Acid, Phenoxyethanol, Potassium Sorbate.", fontSize: 6.5, fontFamily: F.body, fontWeight: "400", fill: "#666666", textAlign: "left", lineHeight: 1.7, _role: "text", _label: "Ingredients", editable: true },
      // Bottom line
      { type: "line", offsetX: 10, offsetY: 140, x1: 0, y1: 0, x2: 120, y2: 0, stroke: "#E0E0E0", strokeWidth: 0.3, _role: "decoration" },
      // Caution
      { type: "textbox", offsetX: 10, offsetY: 146, width: 120, text: "For external use only. Avoid contact with eyes. Discontinue use if irritation occurs.", fontSize: 5.5, fontFamily: F.body, fontWeight: "400", fill: "#999999", textAlign: "left", lineHeight: 1.6, _role: "text", _label: "Caution", editable: true },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. BARCODE + PRODUCT INFO BLOCK
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "info-barcode",
    name: "Barcode Info",
    nameKo: "바코드 정보",
    category: "info",
    subcategory: "Barcode",
    description: "Clean barcode area with product details",
    colors: ["#FFFFFF", "#1A1A1A", "#888888", "#E5E5E5"],
    fonts: [F.heading, F.body],
    templateW: 120,
    templateH: 80,
    objects: [
      { type: "rect", offsetX: 0, offsetY: 0, width: 120, height: 80, fill: "#FFFFFF", _role: "bg", _label: "Background", selectable: true },
      // Barcode placeholder
      { type: "rect", offsetX: 10, offsetY: 8, width: 50, height: 35, fill: "#F5F5F5", stroke: "#E5E5E5", strokeWidth: 0.3, _role: "placeholder", _label: "Barcode Area" },
      { type: "textbox", offsetX: 10, offsetY: 16, width: 50, text: "BARCODE\nHERE", fontSize: 7, fontFamily: F.heading, fontWeight: "400", fill: "#CCCCCC", textAlign: "center", lineHeight: 1.3, _role: "placeholder" },
      // EAN
      { type: "textbox", offsetX: 10, offsetY: 46, width: 50, text: "8 801234 567890", fontSize: 6, fontFamily: F.body, fontWeight: "400", fill: "#888888", textAlign: "center", charSpacing: 50, _role: "text", _label: "EAN", editable: true },
      // Product info (right)
      { type: "textbox", offsetX: 68, offsetY: 8, width: 46, text: "Made in Korea", fontSize: 6, fontFamily: F.body, fontWeight: "400", fill: "#888888", textAlign: "left", _role: "text", _label: "Origin", editable: true },
      { type: "textbox", offsetX: 68, offsetY: 20, width: 46, text: "Mfg: 2026.01\nExp: 2028.01", fontSize: 5.5, fontFamily: F.body, fontWeight: "400", fill: "#888888", textAlign: "left", lineHeight: 1.5, _role: "text", _label: "Dates", editable: true },
      { type: "textbox", offsetX: 68, offsetY: 42, width: 46, text: "Your Brand Co.\nSeoul, Korea\nTel: 02-1234-5678", fontSize: 5, fontFamily: F.body, fontWeight: "400", fill: "#AAAAAA", textAlign: "left", lineHeight: 1.5, _role: "text", _label: "Company", editable: true },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. DECORATIVE DIVIDER SET
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "deco-dividers",
    name: "Divider Set",
    nameKo: "디바이더 세트",
    category: "deco",
    subcategory: "Lines",
    description: "A set of elegant dividers and separators",
    colors: ["transparent", "#1A1A1A", "#C8C2B8", "#D4AF37"],
    fonts: [F.body],
    templateW: 160,
    templateH: 100,
    objects: [
      // Thin solid
      { type: "line", offsetX: 10, offsetY: 10, x1: 0, y1: 0, x2: 140, y2: 0, stroke: "#1A1A1A", strokeWidth: 0.3, _role: "decoration", _label: "Thin Line" },
      // Medium with diamond
      { type: "line", offsetX: 10, offsetY: 30, x1: 0, y1: 0, x2: 60, y2: 0, stroke: "#C8C2B8", strokeWidth: 0.4, _role: "decoration" },
      { type: "textbox", offsetX: 72, offsetY: 25, width: 16, text: "◆", fontSize: 5, fontFamily: F.body, fill: "#C8C2B8", textAlign: "center", _role: "decoration" },
      { type: "line", offsetX: 90, offsetY: 30, x1: 0, y1: 0, x2: 60, y2: 0, stroke: "#C8C2B8", strokeWidth: 0.4, _role: "decoration" },
      // Dots
      { type: "textbox", offsetX: 10, offsetY: 44, width: 140, text: "· · · · · · · · · · · · · · · · · · · ·", fontSize: 8, fontFamily: F.body, fill: "#D4D0C8", textAlign: "center", charSpacing: 100, _role: "decoration", _label: "Dot Line" },
      // Double line
      { type: "line", offsetX: 10, offsetY: 65, x1: 0, y1: 0, x2: 140, y2: 0, stroke: "#1A1A1A", strokeWidth: 0.4, _role: "decoration" },
      { type: "line", offsetX: 10, offsetY: 68, x1: 0, y1: 0, x2: 140, y2: 0, stroke: "#1A1A1A", strokeWidth: 0.15, _role: "decoration" },
      // Gold accent line
      { type: "line", offsetX: 40, offsetY: 85, x1: 0, y1: 0, x2: 80, y2: 0, stroke: "#D4AF37", strokeWidth: 0.5, _role: "decoration", _label: "Gold Line" },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. CORNER ORNAMENTS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "deco-corners",
    name: "Corner Frame",
    nameKo: "코너 프레임",
    category: "deco",
    subcategory: "Frame",
    description: "Elegant corner frame decoration",
    colors: ["transparent", "#1A1A1A", "#D4AF37"],
    fonts: [],
    templateW: 160,
    templateH: 200,
    objects: [
      // Top-left corner
      { type: "line", offsetX: 10, offsetY: 10, x1: 0, y1: 20, x2: 0, y2: 0, stroke: "#1A1A1A", strokeWidth: 0.4, _role: "decoration" },
      { type: "line", offsetX: 10, offsetY: 10, x1: 0, y1: 0, x2: 20, y2: 0, stroke: "#1A1A1A", strokeWidth: 0.4, _role: "decoration" },
      // Top-right corner
      { type: "line", offsetX: 150, offsetY: 10, x1: 0, y1: 0, x2: 0, y2: 20, stroke: "#1A1A1A", strokeWidth: 0.4, _role: "decoration" },
      { type: "line", offsetX: 130, offsetY: 10, x1: 0, y1: 0, x2: 20, y2: 0, stroke: "#1A1A1A", strokeWidth: 0.4, _role: "decoration" },
      // Bottom-left corner
      { type: "line", offsetX: 10, offsetY: 190, x1: 0, y1: 0, x2: 0, y2: -20, stroke: "#1A1A1A", strokeWidth: 0.4, _role: "decoration" },
      { type: "line", offsetX: 10, offsetY: 190, x1: 0, y1: 0, x2: 20, y2: 0, stroke: "#1A1A1A", strokeWidth: 0.4, _role: "decoration" },
      // Bottom-right corner
      { type: "line", offsetX: 150, offsetY: 190, x1: 0, y1: 0, x2: 0, y2: -20, stroke: "#1A1A1A", strokeWidth: 0.4, _role: "decoration" },
      { type: "line", offsetX: 130, offsetY: 190, x1: 0, y1: 0, x2: 20, y2: 0, stroke: "#1A1A1A", strokeWidth: 0.4, _role: "decoration" },
      // Inner gold corners (smaller, offset)
      { type: "line", offsetX: 16, offsetY: 16, x1: 0, y1: 10, x2: 0, y2: 0, stroke: "#D4AF37", strokeWidth: 0.25, _role: "decoration" },
      { type: "line", offsetX: 16, offsetY: 16, x1: 0, y1: 0, x2: 10, y2: 0, stroke: "#D4AF37", strokeWidth: 0.25, _role: "decoration" },
      { type: "line", offsetX: 144, offsetY: 16, x1: 0, y1: 0, x2: 0, y2: 10, stroke: "#D4AF37", strokeWidth: 0.25, _role: "decoration" },
      { type: "line", offsetX: 134, offsetY: 16, x1: 0, y1: 0, x2: 10, y2: 0, stroke: "#D4AF37", strokeWidth: 0.25, _role: "decoration" },
    ]
  },

]; // end DESIGN_TEMPLATES

// ─── Helper Functions ────────────────────────────────────────────────────────

export function getDesignTemplatesByCategory(categoryId: string): DesignTemplate[] {
  if (categoryId === "all") return DESIGN_TEMPLATES;
  return DESIGN_TEMPLATES.filter(t => t.category === categoryId);
}

export function getDesignTemplateById(id: string): DesignTemplate | undefined {
  return DESIGN_TEMPLATES.find(t => t.id === id);
}

// ─── SVG Preview Generator ──────────────────────────────────────────────────
export function generateTemplatePreviewSVG(template: DesignTemplate): string {
  const { templateW: w, templateH: h, objects } = template;
  const vb = `0 0 ${w} ${h}`;
  let inner = "";

  for (const obj of objects) {
    const x = obj.offsetX;
    const y = obj.offsetY;
    const fill = obj.fill || "none";
    const stroke = obj.stroke || "none";
    const sw = obj.strokeWidth || 0;
    const op = obj.opacity !== undefined ? obj.opacity : 1;

    switch (obj.type) {
      case "rect":
        inner += `<rect x="${x}" y="${y}" width="${obj.width||0}" height="${obj.height||0}" rx="${obj.rx||0}" ry="${obj.ry||0}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;
        break;
      case "circle":
        inner += `<circle cx="${x}" cy="${y}" r="${obj.radius||0}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;
        break;
      case "line":
        inner += `<line x1="${x + (obj.x1||0)}" y1="${y + (obj.y1||0)}" x2="${x + (obj.x2||0)}" y2="${y + (obj.y2||0)}" stroke="${stroke !== 'none' ? stroke : fill}" stroke-width="${sw||0.3}" opacity="${op}"/>`;
        break;
      case "textbox": {
        const fs = (obj.fontSize || 10) * 0.85;
        const anchor = obj.textAlign === "center" ? "middle" : obj.textAlign === "right" ? "end" : "start";
        const tx = obj.textAlign === "center" ? x + (obj.width || 0) / 2 : obj.textAlign === "right" ? x + (obj.width || 0) : x;
        const fw = obj.fontWeight || "400";
        const fst = obj.fontStyle === "italic" ? "italic" : "normal";
        const lines = (obj.text || "").split("\n");
        const lh = (obj.lineHeight || 1.3) * fs;
        for (let i = 0; i < lines.length; i++) {
          inner += `<text x="${tx}" y="${y + fs + i * lh}" font-size="${fs}" font-weight="${fw}" font-style="${fst}" text-anchor="${anchor}" fill="${fill}" opacity="${op}"><![CDATA[${lines[i]}]]></text>`;
        }
        break;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="100%" height="100%">${inner}</svg>`;
}

// ─── Canvas Placement ───────────────────────────────────────────────────────
export function placeTemplateOnCanvas(
  template: DesignTemplate,
  canvas: any,
  F: any,
  pxPerMm: number = 1
): any[] {
  const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
  const zoom = canvas.getZoom?.() || 1;
  const cw = canvas.getWidth?.() || 1000;
  const ch = canvas.getHeight?.() || 600;

  const centerX = (-vpt[4] + cw / 2) / zoom;
  const centerY = (-vpt[5] + ch / 2) / zoom;

  // Template dimensions in canvas pixels
  const tmplWpx = template.templateW * pxPerMm;
  const tmplHpx = template.templateH * pxPerMm;

  const baseX = centerX - tmplWpx / 2;
  const baseY = centerY - tmplHpx / 2;

  const placed: any[] = [];

  for (const obj of template.objects) {
    const absX = baseX + obj.offsetX * pxPerMm;
    const absY = baseY + obj.offsetY * pxPerMm;

    const commonProps: Record<string, any> = {
      left: absX,
      top: absY,
      originX: "left",
      originY: "top",
      fill: obj.fill || "transparent",
      stroke: obj.stroke || undefined,
      strokeWidth: (obj.strokeWidth || 0) * pxPerMm,
      opacity: obj.opacity !== undefined ? obj.opacity : 1,
      selectable: obj.selectable !== false,
      _templateId: template.id,
      _role: obj._role || "text",
      _label: obj._label || "",
    };

    let fabricObj: any = null;

    switch (obj.type) {
      case "textbox":
        fabricObj = new F.Textbox(obj.text || "Text", {
          ...commonProps,
          width: (obj.width || 100) * pxPerMm,
          fontSize: Math.round((obj.fontSize || 14) * pxPerMm),
          fontFamily: obj.fontFamily || "Inter, Helvetica, sans-serif",
          fontWeight: obj.fontWeight || "400",
          fontStyle: obj.fontStyle || "normal",
          textAlign: obj.textAlign || "left",
          lineHeight: obj.lineHeight || 1.3,
          charSpacing: obj.charSpacing || 0,
          underline: obj.underline || false,
          editable: obj.editable !== false,
        });
        break;

      case "rect":
        fabricObj = new F.Rect({
          ...commonProps,
          width: (obj.width || 50) * pxPerMm,
          height: (obj.height || 50) * pxPerMm,
          rx: (obj.rx || 0) * pxPerMm,
          ry: (obj.ry || 0) * pxPerMm,
        });
        break;

      case "circle":
        fabricObj = new F.Circle({
          ...commonProps,
          radius: (obj.radius || 20) * pxPerMm,
        });
        break;

      case "ellipse":
        fabricObj = new F.Ellipse({
          ...commonProps,
          rx: (obj.rx || 30) * pxPerMm,
          ry: (obj.ry || 20) * pxPerMm,
        });
        break;

      case "line":
        fabricObj = new F.Line(
          [
            (obj.x1 || 0) * pxPerMm,
            (obj.y1 || 0) * pxPerMm,
            (obj.x2 || 0) * pxPerMm,
            (obj.y2 || 0) * pxPerMm
          ],
          {
            ...commonProps,
            stroke: obj.stroke || obj.fill || "#000000",
          }
        );
        break;

      case "path":
        if (obj.path) {
          fabricObj = new F.Path(obj.path, {
            ...commonProps,
            scaleX: pxPerMm,
            scaleY: pxPerMm,
          });
        }
        break;
    }

    if (fabricObj) {
      canvas.add(fabricObj);
      if (obj._role === "bg") {
        canvas.sendObjectToBack(fabricObj);
      }
      placed.push(fabricObj);
    }
  }

  // Select all editable objects
  const selectable = placed.filter((o: any) => o.selectable);
  if (selectable.length > 1) {
    const sel = new F.ActiveSelection(selectable, { canvas });
    canvas.setActiveObject(sel);
  } else if (selectable.length === 1) {
    canvas.setActiveObject(selectable[0]);
  }

  canvas.requestRenderAll();

  console.log(
    `[Template] Placed: ${template.name} (${placed.length} objects) at ${Math.round(baseX)},${Math.round(baseY)} | pxPerMm=${pxPerMm.toFixed(2)}`
  );

  return placed;
}
