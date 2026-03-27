// --- Dieline Template Library v4 ---
// FEFCO + ECMA global standard, structure-based categories
// Distinctive 3D isometric SVG icons for each box type

export interface DielineTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  svgPath: string;
  dimensions: string;
  description: string;
  iconSvg: string;
}

export interface BoxCategory {
  id: string;
  label: string;
  standard: 'FEFCO' | 'ECMA' | 'ALL';
  description: string;
  color: string;
  icon: string;
}

export const BOX_CATEGORIES: BoxCategory[] = [
  { id: 'all', label: 'All Types', standard: 'ALL', description: 'All box structures', color: '#374151', icon: '' },
  { id: 'slotted', label: 'Slotted', standard: 'FEFCO', description: 'Shipping & delivery boxes', color: '#2563EB', icon: '' },
  { id: 'telescope', label: 'Telescope', standard: 'FEFCO', description: 'Gift boxes, shoe boxes', color: '#7C3AED', icon: '' },
  { id: 'tray-folder', label: 'Tray & Folder', standard: 'FEFCO', description: 'Pizza boxes, low trays', color: '#059669', icon: '' },
  { id: 'slide', label: 'Slide', standard: 'FEFCO', description: 'Premium gift boxes, matchboxes', color: '#D97706', icon: '' },
  { id: 'ready-glued', label: 'Ready-Glued', standard: 'FEFCO', description: 'Pop-up auto-bottom boxes', color: '#DC2626', icon: '' },
  { id: 'tuck-end', label: 'Tuck End', standard: 'ECMA', description: 'Cosmetic, pharma & food cartons', color: '#DB2777', icon: '' },
  { id: 'tray-lid', label: 'Tray & Lid', standard: 'ECMA', description: 'Premium gifts, fruit & shoe boxes', color: '#0D9488', icon: '' },
];

// ============================================================
// Distinctive SVG Icons — each box type has unique visual cues
// ============================================================

// FEFCO 0201: RSC — open top flaps, visible interior
function icon_fefco_0201(): string {
  const c = '#2563EB';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- body -->
    <path d="M15,42 L50,26 L85,42 L50,58Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M15,42 L15,72 L50,88 L50,58Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M50,58 L50,88 L85,72 L85,42Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- open top flaps -->
    <path d="M15,42 L30,28 L50,20 L50,26Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M50,26 L50,20 L70,28 L85,42Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- flap fold lines -->
    <line x1="30" y1="28" x2="30" y2="22" stroke="${c}" stroke-width="2.5" stroke-dasharray="2,2"/>
    <line x1="70" y1="28" x2="70" y2="22" stroke="${c}" stroke-width="2.5" stroke-dasharray="2,2"/>
  </svg>`;
}

// FEFCO 0215: Full overlap — flaps cross over
function icon_fefco_0215(): string {
  const c = '#2563EB';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M15,44 L50,28 L85,44 L50,60Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M15,44 L15,72 L50,88 L50,60Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M50,60 L50,88 L85,72 L85,44Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- overlapping flaps (crossed) -->
    <path d="M20,42 L50,22 L56,25 L26,45Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M80,42 L50,22 L44,25 L74,45Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- overlap indicator -->
    <path d="M44,25 L50,22 L56,25 L50,28Z" fill="${c}" fill-opacity="0.6" stroke="none"/>
  </svg>`;
}

// FEFCO 03xx: Telescope — lid floating above body
function icon_fefco_03xx(): string {
  const c = '#7C3AED';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- body (lower) -->
    <path d="M18,52 L50,40 L82,52 L50,64Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M18,52 L18,76 L50,88 L50,64Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M50,64 L50,88 L82,76 L82,52Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- lid (floating above) -->
    <path d="M14,30 L50,16 L86,30 L50,44Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M14,30 L14,38 L50,52 L50,44Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M50,44 L50,52 L86,38 L86,30Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- gap indicator -->
    <line x1="18" y1="44" x2="18" y2="52" stroke="${c}" stroke-width="2.5" stroke-dasharray="2,1.5" opacity="1"/>
    <line x1="82" y1="38" x2="82" y2="52" stroke="${c}" stroke-width="2.5" stroke-dasharray="2,1.5" opacity="1"/>
  </svg>`;
}

// FEFCO 04xx: Tray — low walls, open top
function icon_fefco_04xx(): string {
  const c = '#059669';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- base -->
    <path d="M12,48 L50,34 L88,48 L50,62Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- low left wall -->
    <path d="M12,48 L12,58 L50,72 L50,62Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- low right wall -->
    <path d="M50,62 L50,72 L88,58 L88,48Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- inner bottom visible -->
    <path d="M20,50 L50,38 L80,50 L50,62Z" fill="${c}" fill-opacity="0.6" stroke="none"/>
  </svg>`;
}

// FEFCO 05xx: Slide — inner tray pulled out from sleeve
function icon_fefco_05xx(): string {
  const c = '#D97706';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- outer sleeve -->
    <path d="M18,40 L50,26 L82,40 L50,54Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M18,40 L18,66 L50,80 L50,54Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M50,54 L50,80 L82,66 L82,40Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- inner tray (pulled out to bottom-right) -->
    <path d="M40,56 L62,46 L90,56 L68,66Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M40,56 L40,68 L68,78 L68,66Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M68,66 L68,78 L90,68 L90,56Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- pull arrow -->
    <line x1="56" y1="60" x2="72" y2="68" stroke="${c}" stroke-width="2.5" opacity="1"/>
    <path d="M70,65 L72,68 L68,68Z" fill="${c}" opacity="1"/>
  </svg>`;
}

// FEFCO 07xx: Ready-Glued — collapsed flat, pop-up arrows
function icon_fefco_07xx(): string {
  const c = '#DC2626';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- body -->
    <path d="M15,42 L50,26 L85,42 L50,58Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M15,42 L15,70 L50,86 L50,58Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M50,58 L50,86 L85,70 L85,42Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- glue mark -->
    <line x1="15" y1="46" x2="15" y2="66" stroke="${c}" stroke-width="2.5" opacity="1"/>
    <!-- pop-up arrows -->
    <line x1="50" y1="22" x2="50" y2="12" stroke="${c}" stroke-width="2.5" opacity="1"/>
    <path d="M47,14 L50,10 L53,14Z" fill="${c}" opacity="1"/>
    <line x1="30" y1="32" x2="24" y2="26" stroke="${c}" stroke-width="2.5" opacity="1"/>
    <line x1="70" y1="32" x2="76" y2="26" stroke="${c}" stroke-width="2.5" opacity="1"/>
  </svg>`;
}

// ECMA A: Tuck End — front panel with tuck flap open
function icon_ecma_a(): string {
  const c = '#DB2777';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- tall narrow body -->
    <path d="M22,38 L50,26 L78,38 L50,50Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M22,38 L22,76 L50,88 L50,50Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M50,50 L50,88 L78,76 L78,38Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- tuck flap (open, tilted forward) -->
    <path d="M22,38 L35,25 L63,25 L50,38Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- tuck tab -->
    <path d="M35,25 L40,18 L58,18 L63,25Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5" stroke-dasharray="2,2"/>
  </svg>`;
}

// ECMA B: Tray & Lid — separate tray with lid above
function icon_ecma_b(): string {
  const c = '#0D9488';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- tray (lower) -->
    <path d="M18,58 L50,48 L82,58 L50,68Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M18,58 L18,74 L50,84 L50,68Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M50,68 L50,84 L82,74 L82,58Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- lid (above, slightly offset) -->
    <path d="M14,30 L50,18 L86,30 L50,42Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M14,30 L14,36 L50,48 L50,42Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <path d="M50,42 L50,48 L86,36 L86,30Z" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2.5"/>
    <!-- separation -->
    <line x1="50" y1="48" x2="50" y2="54" stroke="${c}" stroke-width="2.5" stroke-dasharray="2,1.5" opacity="1"/>
  </svg>`;
}

// ============================================================
// Template Definitions
// ============================================================

export const DIELINE_TEMPLATES: DielineTemplate[] = [
  {
    id: 'fefco-0201-300x200x250',
    name: 'Regular Slotted Container',
    code: 'FEFCO 0201',
    category: 'slotted',
    svgPath: '/dielines/FEFCO-0201_300_200_250.svg',
    dimensions: '300 × 200 × 250 mm',
    description: 'Most common shipping box with four flaps meeting at center',
    iconSvg: icon_fefco_0201(),
  },
  {
    id: 'fefco-0215-120x60x160',
    name: 'Full Overlap Slotted',
    code: 'FEFCO 0215',
    category: 'slotted',
    svgPath: '/dielines/FEFCO-0215_120_60_160.svg',
    dimensions: '120 × 60 × 160 mm',
    description: 'Full overlap flaps for extra strength and protection',
    iconSvg: icon_fefco_0215(),
  },
  {
    id: 'ecma-a20-80x40x120',
    name: 'Straight Tuck Carton',
    code: 'ECMA A20.20.03.03',
    category: 'tuck-end',
    svgPath: '/dielines/ECMA-A20.20.03.03_80_40_120.svg',
    dimensions: '80 × 40 × 120 mm',
    description: 'Classic retail carton with straight tuck-in flaps on both ends',
    iconSvg: icon_ecma_a(),
  },
];

// ============================================================
// Utility Functions
// ============================================================

export function getTemplatesByCategory(categoryId: string): DielineTemplate[] {
  if (categoryId === 'all') return DIELINE_TEMPLATES;
  return DIELINE_TEMPLATES.filter(t => t.category === categoryId);
}

export function getTemplateById(id: string): DielineTemplate | undefined {
  return DIELINE_TEMPLATES.find(t => t.id === id);
}

export function getCategoriesWithTemplates(): BoxCategory[] {
  const catsWithItems = new Set(DIELINE_TEMPLATES.map(t => t.category));
  return BOX_CATEGORIES.filter(c => c.id === 'all' || catsWithItems.has(c.id));
}
