# Create packaging symbols SVG data file
symbols = '''// Packaging Warning Symbols - SVG paths for corrugated box marking
// All symbols are original vector paths, free to use commercially

export interface PackagingSymbol {
  id: string;
  name: string;
  nameKo: string;
  category: "handling" | "recycling" | "warning" | "certification" | "environment";
  svg: string;
}

export const PACKAGING_SYMBOLS: PackagingSymbol[] = [
  // ═══ HANDLING ═══
  {
    id: "fragile",
    name: "Fragile",
    nameKo: "\\uae68\\uc9c0\\uae30 \\uc26c\\uc6c0",
    category: "handling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 5 L55 35 L70 35 L58 50 L65 80 L50 65 L35 80 L42 50 L30 35 L45 35 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M35 20 C35 10 65 10 65 20" fill="none" stroke="currentColor" stroke-width="3"/><line x1="50" y1="20" x2="50" y2="5" stroke="currentColor" stroke-width="3"/><path d="M30 85 L50 95 L70 85" fill="none" stroke="currentColor" stroke-width="2"/><path d="M25 35 C25 15 75 15 75 35 L75 70 C75 75 70 80 65 80 L35 80 C30 80 25 75 25 70 Z" fill="none" stroke="currentColor" stroke-width="3"/><line x1="50" y1="35" x2="50" y2="70" stroke="currentColor" stroke-width="2"/><line x1="40" y1="45" x2="60" y2="55" stroke="currentColor" stroke-width="2"/></svg>\
  },
  {
    id: "handle-with-care",
    name: "Handle with Care",
    nameKo: "\\ucde8\\uae09\\uc8fc\\uc758",
    category: "handling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20 55 C20 35 35 25 50 25 C65 25 80 35 80 55 L80 75 L20 75 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M10 75 C10 60 20 55 20 55" fill="none" stroke="currentColor" stroke-width="3"/><path d="M90 75 C90 60 80 55 80 55" fill="none" stroke="currentColor" stroke-width="3"/><path d="M10 75 L10 85 L90 85 L90 75" fill="none" stroke="currentColor" stroke-width="3"/><rect x="35" y="30" width="30" height="25" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>\
  },
  {
    id: "this-side-up",
    name: "This Side Up",
    nameKo: "\\uc704\\ucabd \\ud45c\\uc2dc",
    category: "handling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="35,65 50,25 65,65" fill="currentColor"/><polygon points="30,80 50,40 70,80" fill="none" stroke="currentColor" stroke-width="3"/><line x1="20" y1="88" x2="80" y2="88" stroke="currentColor" stroke-width="4"/></svg>\
  },
  {
    id: "keep-dry",
    name: "Keep Dry",
    nameKo: "\\ubb3c\\uae30 \\uae08\\uc9c0",
    category: "handling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M25 35 C15 35 10 28 15 20 C18 15 25 12 30 15 C32 8 40 5 48 8 C52 2 62 0 68 5 C72 2 80 3 83 8 C90 7 95 13 93 20 C97 25 93 33 85 35" fill="none" stroke="currentColor" stroke-width="3"/><line x1="30" y1="45" x2="30" y2="60" stroke="currentColor" stroke-width="2"/><line x1="42" y1="42" x2="42" y2="62" stroke="currentColor" stroke-width="2"/><line x1="54" y1="45" x2="54" y2="65" stroke="currentColor" stroke-width="2"/><line x1="66" y1="42" x2="66" y2="58" stroke="currentColor" stroke-width="2"/><line x1="36" y1="55" x2="36" y2="70" stroke="currentColor" stroke-width="2"/><line x1="48" y1="55" x2="48" y2="72" stroke="currentColor" stroke-width="2"/><line x1="60" y1="52" x2="60" y2="68" stroke="currentColor" stroke-width="2"/><line x1="15" y1="80" x2="85" y2="80" stroke="currentColor" stroke-width="3"/><line x1="20" y1="80" x2="10" y2="92" stroke="currentColor" stroke-width="2.5"/><line x1="40" y1="80" x2="30" y2="92" stroke="currentColor" stroke-width="2.5"/><line x1="60" y1="80" x2="50" y2="92" stroke="currentColor" stroke-width="2.5"/><line x1="80" y1="80" x2="70" y2="92" stroke="currentColor" stroke-width="2.5"/></svg>\
  },
  {
    id: "do-not-stack",
    name: "Do Not Stack",
    nameKo: "\\uc801\\uc7ac\\uae08\\uc9c0",
    category: "handling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="55" width="50" height="35" rx="2" fill="none" stroke="currentColor" stroke-width="3"/><rect x="30" y="20" width="40" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" stroke-width="4"/><line x1="85" y1="15" x2="15" y2="85" stroke="currentColor" stroke-width="4"/></svg>\
  },
  {
    id: "no-hooks",
    name: "No Hooks",
    nameKo: "\\ud6c5 \\uc0ac\\uc6a9\\uae08\\uc9c0",
    category: "handling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 20 L50 50 C50 60 60 65 65 55" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="3"/><line x1="25" y1="25" x2="75" y2="75" stroke="currentColor" stroke-width="3.5"/></svg>\
  },
  {
    id: "temperature-limit",
    name: "Temperature Limit",
    nameKo: "\\uc628\\ub3c4 \\uc81c\\ud55c",
    category: "handling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="43" y="10" width="14" height="60" rx="7" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="78" r="14" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="78" r="8" fill="currentColor"/><rect x="47" y="35" width="6" height="35" rx="3" fill="currentColor"/></svg>\
  },
  {
    id: "clamp-here",
    name: "Clamp Here",
    nameKo: "\\ud074\\ub7a8\\ud504 \\uc704\\uce58",
    category: "handling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="40" height="60" rx="2" fill="none" stroke="currentColor" stroke-width="3"/><path d="M10 40 L30 40 L30 60 L10 60" fill="none" stroke="currentColor" stroke-width="3"/><path d="M90 40 L70 40 L70 60 L90 60" fill="none" stroke="currentColor" stroke-width="3"/><line x1="5" y1="40" x2="5" y2="60" stroke="currentColor" stroke-width="4"/><line x1="95" y1="40" x2="95" y2="60" stroke="currentColor" stroke-width="4"/></svg>\
  },
  {
    id: "center-of-gravity",
    name: "Center of Gravity",
    nameKo: "\\ubb34\\uac8c\\uc911\\uc2ec",
    category: "handling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="20,80 50,20 80,80" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="60" r="8" fill="currentColor"/><line x1="50" y1="52" x2="50" y2="30" stroke="currentColor" stroke-width="2"/><line x1="42" y1="60" x2="25" y2="70" stroke="currentColor" stroke-width="2"/><line x1="58" y1="60" x2="75" y2="70" stroke="currentColor" stroke-width="2"/></svg>\
  },
  {
    id: "sling-here",
    name: "Sling Here",
    nameKo: "\\uc2ac\\ub9c1 \\uc704\\uce58",
    category: "handling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="40" width="50" height="40" rx="2" fill="none" stroke="currentColor" stroke-width="3"/><path d="M25 50 L15 30 L50 10 L85 30 L75 50" fill="none" stroke="currentColor" stroke-width="3"/><line x1="50" y1="10" x2="50" y2="3" stroke="currentColor" stroke-width="3"/></svg>\
  },

  // ═══ RECYCLING ═══
  {
    id: "recycle",
    name: "Recycle",
    nameKo: "\\uc7ac\\ud65c\\uc6a9",
    category: "recycling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 15 L60 30 L55 30 L55 45 L45 45 L45 30 L40 30 Z" fill="currentColor" transform="rotate(0,50,50)"/><path d="M50 15 L60 30 L55 30 L55 45 L45 45 L45 30 L40 30 Z" fill="currentColor" transform="rotate(120,50,50)"/><path d="M50 15 L60 30 L55 30 L55 45 L45 45 L45 30 L40 30 Z" fill="currentColor" transform="rotate(240,50,50)"/><path d="M50 20 C35 20 22 30 18 45" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M18 45 C18 62 28 75 42 82" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M42 82 C57 88 73 82 82 70" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>\
  },
  {
    id: "pet-1",
    name: "PET #1",
    nameKo: "PET 1\\ubc88",
    category: "recycling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(0,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(120,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(240,50,45)"/><path d="M50 15 C33 15 20 28 18 42" fill="none" stroke="currentColor" stroke-width="5"/><path d="M18 42 C16 58 26 72 40 78" fill="none" stroke="currentColor" stroke-width="5"/><path d="M40 78 C56 85 74 78 82 63" fill="none" stroke="currentColor" stroke-width="5"/><text x="50" y="52" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">1</text><text x="50" y="95" text-anchor="middle" font-size="14" font-weight="bold" fill="currentColor">PET</text></svg>\
  },
  {
    id: "hdpe-2",
    name: "HDPE #2",
    nameKo: "HDPE 2\\ubc88",
    category: "recycling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(0,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(120,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(240,50,45)"/><path d="M50 15 C33 15 20 28 18 42" fill="none" stroke="currentColor" stroke-width="5"/><path d="M18 42 C16 58 26 72 40 78" fill="none" stroke="currentColor" stroke-width="5"/><path d="M40 78 C56 85 74 78 82 63" fill="none" stroke="currentColor" stroke-width="5"/><text x="50" y="52" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">2</text><text x="50" y="95" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">HDPE</text></svg>\
  },
  {
    id: "pvc-3",
    name: "PVC #3",
    nameKo: "PVC 3\\ubc88",
    category: "recycling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(0,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(120,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(240,50,45)"/><path d="M50 15 C33 15 20 28 18 42" fill="none" stroke="currentColor" stroke-width="5"/><path d="M18 42 C16 58 26 72 40 78" fill="none" stroke="currentColor" stroke-width="5"/><path d="M40 78 C56 85 74 78 82 63" fill="none" stroke="currentColor" stroke-width="5"/><text x="50" y="52" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">3</text><text x="50" y="95" text-anchor="middle" font-size="13" font-weight="bold" fill="currentColor">PVC</text></svg>\
  },
  {
    id: "ldpe-4",
    name: "LDPE #4",
    nameKo: "LDPE 4\\ubc88",
    category: "recycling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(0,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(120,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(240,50,45)"/><path d="M50 15 C33 15 20 28 18 42" fill="none" stroke="currentColor" stroke-width="5"/><path d="M18 42 C16 58 26 72 40 78" fill="none" stroke="currentColor" stroke-width="5"/><path d="M40 78 C56 85 74 78 82 63" fill="none" stroke="currentColor" stroke-width="5"/><text x="50" y="52" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">4</text><text x="50" y="95" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">LDPE</text></svg>\
  },
  {
    id: "pp-5",
    name: "PP #5",
    nameKo: "PP 5\\ubc88",
    category: "recycling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(0,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(120,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(240,50,45)"/><path d="M50 15 C33 15 20 28 18 42" fill="none" stroke="currentColor" stroke-width="5"/><path d="M18 42 C16 58 26 72 40 78" fill="none" stroke="currentColor" stroke-width="5"/><path d="M40 78 C56 85 74 78 82 63" fill="none" stroke="currentColor" stroke-width="5"/><text x="50" y="52" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">5</text><text x="50" y="95" text-anchor="middle" font-size="14" font-weight="bold" fill="currentColor">PP</text></svg>\
  },
  {
    id: "ps-6",
    name: "PS #6",
    nameKo: "PS 6\\ubc88",
    category: "recycling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(0,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(120,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(240,50,45)"/><path d="M50 15 C33 15 20 28 18 42" fill="none" stroke="currentColor" stroke-width="5"/><path d="M18 42 C16 58 26 72 40 78" fill="none" stroke="currentColor" stroke-width="5"/><path d="M40 78 C56 85 74 78 82 63" fill="none" stroke="currentColor" stroke-width="5"/><text x="50" y="52" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">6</text><text x="50" y="95" text-anchor="middle" font-size="14" font-weight="bold" fill="currentColor">PS</text></svg>\
  },
  {
    id: "other-7",
    name: "Other #7",
    nameKo: "\\uae30\\ud0c0 7\\ubc88",
    category: "recycling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(0,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(120,50,45)"/><path d="M50 10 L62 28 L57 28 L57 42 L47 42 L47 28 L42 28 Z" fill="currentColor" transform="rotate(240,50,45)"/><path d="M50 15 C33 15 20 28 18 42" fill="none" stroke="currentColor" stroke-width="5"/><path d="M18 42 C16 58 26 72 40 78" fill="none" stroke="currentColor" stroke-width="5"/><path d="M40 78 C56 85 74 78 82 63" fill="none" stroke="currentColor" stroke-width="5"/><text x="50" y="52" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">7</text><text x="50" y="95" text-anchor="middle" font-size="11" font-weight="bold" fill="currentColor">OTHER</text></svg>\
  },

  // ═══ WARNING ═══
  {
    id: "flammable",
    name: "Flammable",
    nameKo: "\\uc778\\ud654\\uc131",
    category: "warning",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 8 C50 8 65 25 65 40 C72 32 78 35 78 48 C78 70 65 85 50 90 C35 85 22 70 22 48 C22 35 28 32 35 40 C35 25 50 8 50 8 Z" fill="currentColor"/><path d="M50 50 C50 50 58 58 58 65 C58 72 54 78 50 80 C46 78 42 72 42 65 C42 58 50 50 50 50 Z" fill="white"/></svg>\
  },
  {
    id: "caution",
    name: "Caution",
    nameKo: "\\uc8fc\\uc758",
    category: "warning",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 5 L95 90 L5 90 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><rect x="47" y="35" width="6" height="30" rx="3" fill="currentColor"/><circle cx="50" cy="75" r="4" fill="currentColor"/></svg>\
  },
  {
    id: "warning-diamond",
    name: "Warning Diamond",
    nameKo: "\\uacbd\\uace0 \\ub2e4\\uc774\\uc544\\ubaac\\ub4dc",
    category: "warning",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="70" height="70" rx="5" transform="rotate(45,50,50)" fill="none" stroke="currentColor" stroke-width="4"/><rect x="47" y="28" width="6" height="28" rx="3" fill="currentColor"/><circle cx="50" cy="65" r="4.5" fill="currentColor"/></svg>\
  },
  {
    id: "corrosive",
    name: "Corrosive",
    nameKo: "\\ubd80\\uc2dd\\uc131",
    category: "warning",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M35 15 L45 15 L45 30 C45 35 55 35 55 30 L55 15 L65 15 L65 35 C68 50 60 55 60 65 C60 80 70 85 70 90 L30 90 C30 85 40 80 40 65 C40 55 32 50 35 35 Z" fill="currentColor"/><circle cx="42" cy="82" r="3" fill="white"/><circle cx="52" cy="78" r="2" fill="white"/><circle cx="58" cy="84" r="2.5" fill="white"/></svg>\
  },
  {
    id: "explosive",
    name: "Explosive",
    nameKo: "\\ud3ed\\ubc1c\\uc131",
    category: "warning",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 58,35 90,35 64,55 74,85 50,68 26,85 36,55 10,35 42,35" fill="currentColor"/></svg>\
  },

  // ═══ ENVIRONMENT ═══
  {
    id: "keep-frozen",
    name: "Keep Frozen",
    nameKo: "\\ub0c9\\ub3d9\\ubcf4\\uad00",
    category: "environment",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" stroke-width="3"/><line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="3"/><line x1="22" y1="22" x2="78" y2="78" stroke="currentColor" stroke-width="3"/><line x1="78" y1="22" x2="22" y2="78" stroke="currentColor" stroke-width="3"/><line x1="50" y1="10" x2="42" y2="18" stroke="currentColor" stroke-width="2.5"/><line x1="50" y1="10" x2="58" y2="18" stroke="currentColor" stroke-width="2.5"/><line x1="50" y1="90" x2="42" y2="82" stroke="currentColor" stroke-width="2.5"/><line x1="50" y1="90" x2="58" y2="82" stroke="currentColor" stroke-width="2.5"/><line x1="10" y1="50" x2="18" y2="42" stroke="currentColor" stroke-width="2.5"/><line x1="10" y1="50" x2="18" y2="58" stroke="currentColor" stroke-width="2.5"/><line x1="90" y1="50" x2="82" y2="42" stroke="currentColor" stroke-width="2.5"/><line x1="90" y1="50" x2="82" y2="58" stroke="currentColor" stroke-width="2.5"/></svg>\
  },
  {
    id: "protect-sunlight",
    name: "Protect from Sunlight",
    nameKo: "\\uc9c1\\uc0ac\\uad11\\uc120 \\uae08\\uc9c0",
    category: "environment",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" stroke-width="3"/><line x1="50" y1="10" x2="50" y2="25" stroke="currentColor" stroke-width="3"/><line x1="50" y1="75" x2="50" y2="90" stroke="currentColor" stroke-width="3"/><line x1="10" y1="50" x2="25" y2="50" stroke="currentColor" stroke-width="3"/><line x1="75" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="3"/><line x1="22" y1="22" x2="33" y2="33" stroke="currentColor" stroke-width="3"/><line x1="67" y1="67" x2="78" y2="78" stroke="currentColor" stroke-width="3"/><line x1="78" y1="22" x2="67" y2="33" stroke="currentColor" stroke-width="3"/><line x1="33" y1="67" x2="22" y2="78" stroke="currentColor" stroke-width="3"/></svg>\
  },
  {
    id: "use-no-forklift",
    name: "No Forklift",
    nameKo: "\\uc9c0\\uac8c\\ucc28 \\uae08\\uc9c0",
    category: "handling",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="50" width="50" height="25" rx="3" fill="none" stroke="currentColor" stroke-width="3"/><line x1="65" y1="55" x2="85" y2="55" stroke="currentColor" stroke-width="3"/><line x1="85" y1="55" x2="85" y2="75" stroke="currentColor" stroke-width="3"/><circle cx="25" cy="80" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="55" cy="80" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="3"/><line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" stroke-width="3.5"/></svg>\
  },

  // ═══ CERTIFICATION ═══
  {
    id: "ce-mark",
    name: "CE Mark",
    nameKo: "CE \\ub9c8\\ud06c",
    category: "certification",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M35 25 C20 25 10 37 10 50 C10 63 20 75 35 75 C42 75 48 72 52 68" fill="none" stroke="currentColor" stroke-width="6"/><line x1="15" y1="50" x2="48" y2="50" stroke="currentColor" stroke-width="5"/><path d="M60 25 L60 75" stroke="currentColor" stroke-width="6"/><line x1="60" y1="25" x2="85" y2="25" stroke="currentColor" stroke-width="6"/><line x1="60" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="5"/><line x1="60" y1="75" x2="85" y2="75" stroke="currentColor" stroke-width="6"/></svg>\
  },
  {
    id: "fsc",
    name: "FSC",
    nameKo: "FSC \\uc778\\uc99d",
    category: "certification",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 C50 10 30 25 30 50 C30 75 50 90 50 90 C50 90 70 75 70 50 C70 25 50 10 50 10 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M50 20 C45 30 40 40 40 50 C40 65 50 80 50 80" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M50 30 C55 40 58 45 58 55 C58 65 50 80 50 80" fill="none" stroke="currentColor" stroke-width="2"/><line x1="40" y1="45" x2="58" y2="45" stroke="currentColor" stroke-width="1.5"/><line x1="42" y1="55" x2="56" y2="55" stroke="currentColor" stroke-width="1.5"/></svg>\
  },
  {
    id: "iso",
    name: "ISO Certified",
    nameKo: "ISO \\uc778\\uc99d",
    category: "certification",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" stroke-width="2"/><text x="50" y="42" text-anchor="middle" font-size="14" font-weight="bold" fill="currentColor">ISO</text><text x="50" y="62" text-anchor="middle" font-size="12" fill="currentColor">9001</text></svg>\
  },
  {
    id: "bpa-free",
    name: "BPA Free",
    nameKo: "BPA \\ud504\\ub9ac",
    category: "certification",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="3"/><text x="50" y="40" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">BPA</text><text x="50" y="62" text-anchor="middle" font-size="14" font-weight="bold" fill="currentColor">FREE</text><path d="M70 25 C80 35 85 45 85 55 C85 60 83 65 80 70" fill="none" stroke="currentColor" stroke-width="3"/><path d="M78 22 C82 20 86 25 84 28" fill="currentColor"/></svg>\
  },
  {
    id: "export-quality",
    name: "Export Quality",
    nameKo: "\\uc218\\ucd9c\\ud488\\uc9c8",
    category: "certification",
    svg: \<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4,3"/><text x="50" y="42" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">EXPORT</text><text x="50" y="62" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">QUALITY</text></svg>\
  },
];

export const SYMBOL_CATEGORIES = [
  { id: "all", label: "All", labelKo: "\\uc804\\uccb4" },
  { id: "handling", label: "Handling", labelKo: "\\ucde8\\uae09" },
  { id: "recycling", label: "Recycling", labelKo: "\\uc7ac\\ud65c\\uc6a9" },
  { id: "warning", label: "Warning", labelKo: "\\uacbd\\uace0" },
  { id: "environment", label: "Environment", labelKo: "\\ud658\\uacbd" },
  { id: "certification", label: "Certification", labelKo: "\\uc778\\uc99d" },
];
'''

with open('src/lib/packaging-symbols.ts', 'w', encoding='utf-8') as f:
    f.write(symbols)
print(f'Created packaging-symbols.ts: {len(symbols.splitlines())} lines')
