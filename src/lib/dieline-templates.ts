// --- Dieline Template Library v5 ---
// FEFCO + ECMA global standard, 25 box types
// Phase 1-1: Box type expansion (3 → 25)
// EPM API modelName format: fefco_0201, A20_20_03_03

export interface DielineTemplate {
  id: string;
  name: string;
  nameKo: string;
  code: string;
  epmModel: string;        // EPM API modelName
  category: string;
  dimensions: string;
  description: string;
  descriptionKo: string;
  iconSvg: string;
  popularity: number;       // 1-5, for sorting
  supports3d: boolean;      // Phase 3: 3D preview support
  svgPath: string;          // Path to dieline preview SVG in public/
  box3dPath?: string;         // Path to 3D illustration PNG
  needsH?: boolean;          // true for fefco-0310 (telescope H param)
  needsLid?: boolean;        // true for B10, B20 (Lid option)
}

export interface BoxCategory {
  id: string;
  label: string;
  labelKo: string;
  standard: 'FEFCO' | 'ECMA' | 'ALL';
  color: string;
}

export const BOX_CATEGORIES: BoxCategory[] = [
  { id: 'all',         label: 'All Types',     labelKo: '전체',           standard: 'ALL',  description: 'All box structures',               color: '#374151' },
  { id: 'slotted',     label: 'Slotted',       labelKo: '슬롯형',        standard: 'FEFCO', description: 'Shipping & delivery boxes',         color: '#2563EB' },
  { id: 'telescope',   label: 'Telescope',     labelKo: '텔레스코프',     standard: 'FEFCO', description: 'Gift boxes, shoe boxes',            color: '#7C3AED' },
  { id: 'folder',      label: 'Folder & Tray', labelKo: '폴더/트레이',   standard: 'FEFCO', description: 'Pizza boxes, flat trays',           color: '#059669' },
  { id: 'slide',       label: 'Slide',         labelKo: '슬라이드',      standard: 'FEFCO', description: 'Premium gift boxes, matchboxes',    color: '#D97706' },
  { id: 'ready-glued', label: 'Ready-Glued',   labelKo: '접착형',        standard: 'FEFCO', description: 'Pop-up auto-bottom boxes',          color: '#DC2626' },
  { id: 'tuck-end',    label: 'Tuck End',      labelKo: '턱엔드',        standard: 'ECMA',  description: 'Cosmetic, pharma & food cartons',   color: '#DB2777' },
  { id: 'snap-lock',   label: 'Snap Lock',     labelKo: '스냅락',        standard: 'ECMA',  description: 'Auto-bottom retail boxes',          color: '#9333EA' },
  { id: 'tray-lid',    label: 'Tray & Lid',    labelKo: '트레이/뚜껑',   standard: 'ECMA',  description: 'Premium gifts, fruit & shoe boxes', color: '#0D9488' },
];

// ============================================================
// SVG Icon Generators
// ============================================================

function iconSlotted(variant: 'rsc' | 'overlap' | 'center' | 'half'): string {
  const c = '#2563EB';
  const base = `<path d="M15,42 L50,26 L85,42 L50,58Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>
    <path d="M15,42 L15,72 L50,88 L50,58Z" fill="${c}" fill-opacity="0.45" stroke="${c}" stroke-width="2.2"/>
    <path d="M50,58 L50,88 L85,72 L85,42Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>`;
  let flaps = '';
  if (variant === 'rsc') {
    flaps = `<path d="M15,42 L30,28 L50,20 L50,26Z" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="2.2"/>
      <path d="M50,26 L50,20 L70,28 L85,42Z" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="2.2"/>`;
  } else if (variant === 'overlap') {
    flaps = `<path d="M20,42 L50,22 L56,25 L26,45Z" fill="${c}" fill-opacity="0.4" stroke="${c}" stroke-width="2.2"/>
      <path d="M80,42 L50,22 L44,25 L74,45Z" fill="${c}" fill-opacity="0.4" stroke="${c}" stroke-width="2.2"/>`;
  } else if (variant === 'center') {
    flaps = `<path d="M25,42 L38,30 L50,26Z" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="2.2"/>
      <path d="M75,42 L62,30 L50,26Z" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="2.2"/>`;
  } else {
    flaps = `<path d="M15,42 L32,30 L50,24 L50,26Z" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="2.2"/>
      <path d="M85,42 L68,30 L50,24 L50,26Z" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="2.2"/>
      <line x1="50" y1="24" x2="50" y2="18" stroke="${c}" stroke-width="1.5" stroke-dasharray="2,2"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${base}${flaps}</svg>`;
}

function iconTelescope(): string {
  const c = '#7C3AED';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M18,52 L50,40 L82,52 L50,64Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>
    <path d="M18,52 L18,76 L50,88 L50,64Z" fill="${c}" fill-opacity="0.45" stroke="${c}" stroke-width="2.2"/>
    <path d="M50,64 L50,88 L82,76 L82,52Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>
    <path d="M14,30 L50,16 L86,30 L50,44Z" fill="${c}" fill-opacity="0.4" stroke="${c}" stroke-width="2.2"/>
    <path d="M14,30 L14,38 L50,52 L50,44Z" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="2.2"/>
    <path d="M50,44 L50,52 L86,38 L86,30Z" fill="${c}" fill-opacity="0.4" stroke="${c}" stroke-width="2.2"/>
    <line x1="18" y1="44" x2="18" y2="52" stroke="${c}" stroke-width="1.8" stroke-dasharray="2,1.5"/>
    <line x1="82" y1="38" x2="82" y2="52" stroke="${c}" stroke-width="1.8" stroke-dasharray="2,1.5"/>
  </svg>`;
}

function iconFolder(): string {
  const c = '#059669';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,48 L50,34 L88,48 L50,62Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>
    <path d="M12,48 L12,58 L50,72 L50,62Z" fill="${c}" fill-opacity="0.45" stroke="${c}" stroke-width="2.2"/>
    <path d="M50,62 L50,72 L88,58 L88,48Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>
    <path d="M20,50 L50,38 L80,50 L50,62Z" fill="${c}" fill-opacity="0.15" stroke="none"/>
  </svg>`;
}

function iconSlide(): string {
  const c = '#D97706';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M18,40 L50,26 L82,40 L50,54Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>
    <path d="M18,40 L18,66 L50,80 L50,54Z" fill="${c}" fill-opacity="0.45" stroke="${c}" stroke-width="2.2"/>
    <path d="M50,54 L50,80 L82,66 L82,40Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>
    <path d="M40,56 L62,46 L90,56 L68,66Z" fill="${c}" fill-opacity="0.4" stroke="${c}" stroke-width="2.2"/>
    <path d="M40,56 L40,68 L68,78 L68,66Z" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="2.2"/>
    <path d="M68,66 L68,78 L90,68 L90,56Z" fill="${c}" fill-opacity="0.4" stroke="${c}" stroke-width="2.2"/>
  </svg>`;
}

function iconReadyGlued(): string {
  const c = '#DC2626';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M15,42 L50,26 L85,42 L50,58Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>
    <path d="M15,42 L15,70 L50,86 L50,58Z" fill="${c}" fill-opacity="0.45" stroke="${c}" stroke-width="2.2"/>
    <path d="M50,58 L50,86 L85,70 L85,42Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>
    <line x1="50" y1="22" x2="50" y2="12" stroke="${c}" stroke-width="2"/>
    <path d="M47,14 L50,10 L53,14Z" fill="${c}"/>
    <line x1="30" y1="32" x2="24" y2="26" stroke="${c}" stroke-width="2"/>
    <line x1="70" y1="32" x2="76" y2="26" stroke="${c}" stroke-width="2"/>
  </svg>`;
}

function iconTuckEnd(variant: 'straight' | 'reverse' | 'snap'): string {
  const c = variant === 'snap' ? '#9333EA' : '#DB2777';
  const body = `<path d="M22,38 L50,26 L78,38 L50,50Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>
    <path d="M22,38 L22,76 L50,88 L50,50Z" fill="${c}" fill-opacity="0.45" stroke="${c}" stroke-width="2.2"/>
    <path d="M50,50 L50,88 L78,76 L78,38Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>`;
  let top = '';
  if (variant === 'straight') {
    top = `<path d="M22,38 L35,25 L63,25 L50,38Z" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="2.2"/>
      <path d="M35,25 L40,18 L58,18 L63,25Z" fill="${c}" fill-opacity="0.25" stroke="${c}" stroke-width="2.2" stroke-dasharray="2,2"/>`;
  } else if (variant === 'reverse') {
    top = `<path d="M50,38 L63,25 L78,38Z" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="2.2"/>
      <path d="M63,25 L68,18 L78,24 L78,38Z" fill="${c}" fill-opacity="0.25" stroke="${c}" stroke-width="2.2" stroke-dasharray="2,2"/>`;
  } else {
    top = `<path d="M22,38 L30,28 L70,28 L78,38Z" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="2.2"/>
      <circle cx="50" cy="32" r="3" fill="none" stroke="${c}" stroke-width="1.5"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${body}${top}</svg>`;
}

function iconTrayLid(): string {
  const c = '#0D9488';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M18,58 L50,48 L82,58 L50,68Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>
    <path d="M18,58 L18,74 L50,84 L50,68Z" fill="${c}" fill-opacity="0.45" stroke="${c}" stroke-width="2.2"/>
    <path d="M50,68 L50,84 L82,74 L82,58Z" fill="${c}" fill-opacity="0.55" stroke="${c}" stroke-width="2.2"/>
    <path d="M14,30 L50,18 L86,30 L50,42Z" fill="${c}" fill-opacity="0.4" stroke="${c}" stroke-width="2.2"/>
    <path d="M14,30 L14,36 L50,48 L50,42Z" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="2.2"/>
    <path d="M50,42 L50,48 L86,36 L86,30Z" fill="${c}" fill-opacity="0.4" stroke="${c}" stroke-width="2.2"/>
    <line x1="50" y1="48" x2="50" y2="54" stroke="${c}" stroke-width="1.8" stroke-dasharray="2,1.5"/>
  </svg>`;
}

// ============================================================
// 25 Box Templates — sorted by category & popularity
// ============================================================

export const DIELINE_TEMPLATES: DielineTemplate[] = [

  // ─── FEFCO 02: SLOTTED TYPE ───────────────────────────
  {
    id: 'fefco-0201', name: 'Regular Slotted Container (RSC)', nameKo: '일반 슬롯 박스',
    code: 'FEFCO 0201', epmModel: 'fefco_0201', category: 'slotted',
    dimensions: 'L × W × H', description: 'Most common shipping box. Four flaps meet at center.',
    descriptionKo: '가장 보편적인 배송 박스. 4개 플랩이 중앙에서 만남', iconSvg: iconSlotted('rsc'),
    popularity: 5, supports3d: true,
    svgPath: '/dielines/previews/fefco-0201.svg',
    box3dPath: '/dielines/box3d/fefco-0201.png',
  },
  {
    id: 'fefco-0203', name: 'Full Overlap RSC', nameKo: '풀오버랩 슬롯 박스',
    code: 'FEFCO 0203', epmModel: 'fefco_0203', category: 'slotted',
    dimensions: 'L × W × H', description: 'Full overlap flaps for maximum strength.',
    descriptionKo: '플랩 완전 겹침으로 최대 강도', iconSvg: iconSlotted('overlap'),
    popularity: 4, supports3d: true,
    svgPath: '/dielines/previews/fefco-0203.svg',
    box3dPath: '/dielines/box3d/fefco-0203.png',
  },
  {
    id: 'fefco-0210', name: 'Center Meet Slotted', nameKo: '중앙 만남형',
    code: 'FEFCO 0210', epmModel: 'fefco_0210', category: 'slotted',
    dimensions: 'L × W × H', description: 'Economy RSC with center-meeting flaps.',
    descriptionKo: '경제적 슬롯 박스. 플랩이 중앙에서 만남', iconSvg: iconSlotted('center'),
    popularity: 3, supports3d: true,
    svgPath: '/dielines/previews/fefco-0210.svg',
    box3dPath: '/dielines/box3d/fefco-0210.png',
  },
  {
    id: 'fefco-0215', name: 'Full Overlap Slotted', nameKo: '풀오버랩 슬롯',
    code: 'FEFCO 0215', epmModel: 'fefco_0215', category: 'slotted',
    dimensions: 'L × W × H', description: 'Full overlap for extra protection on heavy items.',
    descriptionKo: '무거운 물품 보호용 풀오버랩', iconSvg: iconSlotted('overlap'),
    popularity: 4, supports3d: true,
    svgPath: '/dielines/previews/fefco-0215.svg',
    box3dPath: '/dielines/box3d/fefco-0215.png',
  },
  {
    id: 'fefco-0216', name: 'Half Slotted Container', nameKo: '반슬롯 박스',
    code: 'FEFCO 0216', epmModel: 'fefco_0216', category: 'slotted',
    dimensions: 'L × W × H', description: 'One end open, one end with flaps. For shelving or display.',
    descriptionKo: '한쪽 개방형. 진열/선반용', iconSvg: iconSlotted('half'),
    popularity: 3, supports3d: true,
    svgPath: '/dielines/previews/fefco-0216.svg',
    box3dPath: '/dielines/box3d/fefco-0216.png',
  },
  {
    id: 'fefco-0217', name: 'Overlap Half Slotted', nameKo: '오버랩 반슬롯',
    code: 'FEFCO 0217', epmModel: 'fefco_0217', category: 'slotted',
    dimensions: 'L × W × H', description: 'Half slotted with overlapping flaps for added strength.',
    descriptionKo: '오버랩 플랩 반슬롯 박스', iconSvg: iconSlotted('overlap'),
    popularity: 2, supports3d: true,
    svgPath: '/dielines/previews/fefco-0217.svg',
    box3dPath: '/dielines/box3d/fefco-0217.png',
  },
  {
    id: 'fefco-0225', name: 'Full Telescope RSC', nameKo: '풀 텔레스코프 슬롯',
    code: 'FEFCO 0225', epmModel: 'fefco_0225', category: 'slotted',
    dimensions: 'L × W × H', description: 'Two-piece slotted with full overlap for tall items.',
    descriptionKo: '높은 물품용 2피스 풀오버랩 슬롯', iconSvg: iconSlotted('overlap'),
    popularity: 2, supports3d: false,
    svgPath: '/dielines/previews/fefco-0225.svg',
    box3dPath: '/dielines/box3d/fefco-0225.png',
  },

  // ─── FEFCO 03: TELESCOPE TYPE ─────────────────────────
  {
    id: 'fefco-0301', name: 'Telescope Box (Top & Bottom)', nameKo: '텔레스코프 상하',
    code: 'FEFCO 0301', epmModel: 'fefco_0301', category: 'telescope',
    dimensions: 'L × W × H', description: 'Separate lid fits over base. Classic gift box style.',
    descriptionKo: '뚜껑이 본체에 씌워지는 클래식 선물 박스', iconSvg: iconTelescope(),
    popularity: 5, supports3d: false,
    svgPath: '/dielines/previews/fefco-0301.svg',
    box3dPath: '/dielines/box3d/fefco-0301.png',
  },
  {
    id: 'fefco-0304', name: 'Full Telescope Box', nameKo: '풀 텔레스코프',
    code: 'FEFCO 0304', epmModel: 'fefco_0304', category: 'telescope',
    dimensions: 'L × W × H', description: 'Lid covers full height of base. Shoe box style.',
    descriptionKo: '뚜껑이 본체 전체를 덮음. 신발 박스 스타일', iconSvg: iconTelescope(),
    popularity: 4, supports3d: false,
    svgPath: '/dielines/previews/fefco-0304.svg',
    box3dPath: '/dielines/box3d/fefco-0304.png',
  },
  {
    id: 'fefco-0310', name: 'Telescope Design Box', needsH: true, nameKo: '디자인 텔레스코프',
    code: 'FEFCO 0310', epmModel: 'fefco_0310', category: 'telescope',
    dimensions: 'L × W × H', description: 'Double-wall telescope for extra protection.',
    descriptionKo: '이중벽 텔레스코프 보호 강화', iconSvg: iconTelescope(),
    popularity: 3, supports3d: false,
    svgPath: '/dielines/previews/fefco-0310.svg',
    box3dPath: '/dielines/box3d/fefco-0310.png',
  },

  // ─── FEFCO 04: FOLDER & TRAY TYPE ────────────────────
  {
    id: 'fefco-0401', name: 'One-Piece Folder', nameKo: '원피스 폴더',
    code: 'FEFCO 0401', epmModel: 'fefco_0401', category: 'folder',
    dimensions: 'L × W × H', description: 'Flat box, folds around product. For books, frames.',
    descriptionKo: '제품을 감싸는 플랫 박스. 책/액자용', iconSvg: iconFolder(),
    popularity: 4, supports3d: false,
    svgPath: '/dielines/previews/fefco-0401.svg',
    box3dPath: '/dielines/box3d/fefco-0401.png',
  },
  {
    id: 'fefco-0409', name: 'Four Corner Tray', nameKo: '4코너 트레이',
    code: 'FEFCO 0409', epmModel: 'fefco_0409', category: 'folder',
    dimensions: 'L × W × H', description: 'Open tray with four-corner glued walls.',
    descriptionKo: '4코너 접착 오픈 트레이', iconSvg: iconFolder(),
    popularity: 3, supports3d: false,
    svgPath: '/dielines/previews/fefco-0409.svg',
    box3dPath: '/dielines/box3d/fefco-0409.png',
  },
  {
    id: 'fefco-0421', name: 'Roll-End Tuck-Top', nameKo: '롤엔드 턱탑',
    code: 'FEFCO 0421', epmModel: 'fefco_0421', category: 'folder',
    dimensions: 'L × W × H', description: 'Flat box with roll-end tuck top. Pizza box style.',
    descriptionKo: '롤엔드 턱탑. 피자박스 스타일', iconSvg: iconFolder(),
    popularity: 4, supports3d: false,
    svgPath: '/dielines/previews/fefco-0421.svg',
    box3dPath: '/dielines/box3d/fefco-0421.png',
  },
  {
    id: 'fefco-0427', name: 'Tuck-Top Auto-Bottom', nameKo: '턱탑 자동바닥',
    code: 'FEFCO 0427', epmModel: 'fefco_0427', category: 'folder',
    dimensions: 'L × W × H', description: 'Auto-lock bottom with tuck top. Fast assembly.',
    descriptionKo: '자동 잠금 바닥 + 턱탑. 빠른 조립', iconSvg: iconFolder(),
    popularity: 5, supports3d: false,
    svgPath: '/dielines/previews/fefco-0427.svg',
    box3dPath: '/dielines/box3d/fefco-0427.png',
  },

  // ─── FEFCO 05: SLIDE TYPE ────────────────────────────
  {
    id: 'fefco-0501', name: 'Slide Box (Sleeve + Tray)', nameKo: '슬라이드 박스',
    code: 'FEFCO 0501', epmModel: 'fefco_0501', category: 'slide',
    dimensions: 'L × W × H', description: 'Inner tray slides into outer sleeve. Premium gift box.',
    descriptionKo: '내부 트레이가 외부 슬리브에 삽입. 프리미엄 선물 박스', iconSvg: iconSlide(),
    popularity: 4, supports3d: false,
    svgPath: '/dielines/previews/fefco-0501.svg',
    box3dPath: '/dielines/box3d/fefco-0501.png',
  },
  {
    id: 'fefco-0503', name: 'Full Slide Box', nameKo: '풀 슬라이드',
    code: 'FEFCO 0503', epmModel: 'fefco_0503', category: 'slide',
    dimensions: 'L × W × H', description: 'Fully enclosed slide box. Matchbox style.',
    descriptionKo: '완전 밀폐형 슬라이드. 성냥갑 스타일', iconSvg: iconSlide(),
    popularity: 3, supports3d: false,
    svgPath: '/dielines/previews/fefco-0503.svg',
    box3dPath: '/dielines/box3d/fefco-0503.png',
  },

  // ─── FEFCO 07: READY-GLUED ───────────────────────────
  {
    id: 'fefco-0711', name: 'Ready-Glued Box', nameKo: '접착형 박스',
    code: 'FEFCO 0711', epmModel: 'fefco_0711', category: 'ready-glued',
    dimensions: 'L × W × H', description: 'Pre-glued box, folds flat for storage, pops up.',
    descriptionKo: '사전 접착. 평평하게 보관, 팝업 조립', iconSvg: iconReadyGlued(),
    popularity: 4, supports3d: false,
    svgPath: '/dielines/previews/fefco-0711.svg',
    box3dPath: '/dielines/box3d/fefco-0711.png',
  },
  {
    id: 'fefco-0713', name: 'Ready-Glued Tray', nameKo: '접착형 트레이',
    code: 'FEFCO 0713', epmModel: 'fefco_0713', category: 'ready-glued',
    dimensions: 'L × W × H', description: 'Pre-glued open tray. Fast assembly.',
    descriptionKo: '사전 접착 오픈 트레이. 빠른 조립', iconSvg: iconReadyGlued(),
    popularity: 3, supports3d: false,
    svgPath: '/dielines/previews/fefco-0713.svg',
    box3dPath: '/dielines/box3d/fefco-0713.png',
  },

  // ─── ECMA A: TUCK END ────────────────────────────────
  {
    id: 'ecma-a20-straight', name: 'Straight Tuck End', nameKo: '스트레이트 턱엔드',
    code: 'ECMA A20.20.03.03', epmModel: 'A20_20_03_03', category: 'tuck-end',
    dimensions: 'L × W × D', description: 'Classic retail carton. Tuck flaps on both ends.',
    descriptionKo: '클래식 소매 카톤. 양쪽 턱 플랩', iconSvg: iconTuckEnd('straight'),
    popularity: 5, supports3d: true,
    svgPath: '/dielines/previews/ecma-a20-straight.svg',
    box3dPath: '/dielines/box3d/ecma-a20-straight.png',
  },
  {
    id: 'ecma-a20-reverse', name: 'Reverse Tuck End', nameKo: '리버스 턱엔드',
    code: 'ECMA A20.20.03.01', epmModel: 'A20_20_03_01', category: 'tuck-end',
    dimensions: 'L × W × D', description: 'Tuck flaps open in opposite directions. Pharma standard.',
    descriptionKo: '턱 플랩이 반대 방향. 의약품 표준', iconSvg: iconTuckEnd('reverse'),
    popularity: 4, supports3d: true,
    svgPath: '/dielines/previews/ecma-a20-reverse.svg',
    box3dPath: '/dielines/box3d/ecma-a20-reverse.png',
  },
  {
    id: 'ecma-a10-seal', name: 'Seal End Carton', nameKo: '실엔드 카톤',
    code: 'ECMA A10.10.03.03', epmModel: 'A10_10_03_03', category: 'tuck-end',
    dimensions: 'L × W × D', description: 'Both ends sealed with full overlap flaps. Food packaging.',
    descriptionKo: '양쪽 끝 풀오버랩 밀봉. 식품 포장용', iconSvg: iconTuckEnd('straight'),
    popularity: 3, supports3d: false,
    svgPath: '/dielines/previews/ecma-a10-seal.svg',
    box3dPath: '/dielines/box3d/ecma-a10-seal.png',
  },

  // ─── ECMA A55: SNAP LOCK (AUTO BOTTOM) ────────────────
  {
    id: 'ecma-a55-snaplock', name: 'Snap Lock Bottom', nameKo: '스냅락 바닥',
    code: 'ECMA A55.20.01.03', epmModel: 'A55_20_01_03', category: 'snap-lock',
    dimensions: 'L × W × D', description: 'Auto-locking bottom with tuck top. Quick assembly retail box.',
    descriptionKo: '자동 잠금 바닥 + 턱탑. 빠른 조립 소매 박스', iconSvg: iconTuckEnd('snap'),
    popularity: 5, supports3d: false,
    svgPath: '/dielines/previews/ecma-a55-snaplock.svg',
    box3dPath: '/dielines/box3d/ecma-a55-snaplock.png',
  },
  {
    id: 'ecma-a55-hanger', name: 'Snap Lock with Hanger', nameKo: '스냅락 행거',
    code: 'ECMA A55.21.01.03', epmModel: 'A55_21_01_03', category: 'snap-lock',
    dimensions: 'L × W × D', description: 'Snap lock bottom with euro-hole hanger system.',
    descriptionKo: '스냅락 바닥 + 유로홀 행거', iconSvg: iconTuckEnd('snap'),
    popularity: 3, supports3d: false,
    svgPath: '/dielines/previews/ecma-a55-hanger.svg',
    box3dPath: '/dielines/box3d/ecma-a55-hanger.png',
  },

  // ─── ECMA B: TRAY & LID ──────────────────────────────
  {
    id: 'ecma-b10-tray', name: 'Tray with Lid', needsLid: true, needsH: true, nameKo: '트레이 + 뚜껑',
    code: 'ECMA B10.20.05.01', epmModel: 'B10_02_00_00_Lid', category: 'tray-lid',
    dimensions: 'L × W × D', description: 'Separate tray and lid. Premium presentation box.',
    descriptionKo: '별도 트레이+뚜껑. 프리미엄 프레젠테이션 박스', iconSvg: iconTrayLid(),
    popularity: 4, supports3d: false,
    svgPath: '/dielines/previews/ecma-b10-tray.svg',
    box3dPath: '/dielines/box3d/ecma-b10-tray.png',
  },
  {
    id: 'ecma-b20-hinged', name: 'Hinged Lid Tray', needsLid: true, needsH: true, nameKo: '힌지 뚜껑 트레이',
    code: 'ECMA B20.20.01.05', epmModel: 'B20_01_00_00_Lid', category: 'tray-lid',
    dimensions: 'L × W × D', description: 'Tray with attached hinged lid. One-piece construction.',
    descriptionKo: '경첩형 뚜껑 트레이. 원피스 구조', iconSvg: iconTrayLid(),
    popularity: 3, supports3d: false,
    svgPath: '/dielines/previews/ecma-b20-hinged.svg',
    box3dPath: '/dielines/box3d/ecma-b20-hinged.png',
  },
];

// ============================================================
// Utility Functions
// ============================================================

export function getTemplatesByCategory(categoryId: string): DielineTemplate[] {
  if (categoryId === 'all') return [...DIELINE_TEMPLATES].sort((a, b) => b.popularity - a.popularity);
  return DIELINE_TEMPLATES.filter(t => t.category === categoryId).sort((a, b) => b.popularity - a.popularity);
}

export function getTemplateById(id: string): DielineTemplate | undefined {
  return DIELINE_TEMPLATES.find(t => t.id === id);
}

export function getTemplateByCode(code: string): DielineTemplate | undefined {
  return DIELINE_TEMPLATES.find(t => t.code === code);
}

export function getTemplateByEpmModel(epmModel: string): DielineTemplate | undefined {
  return DIELINE_TEMPLATES.find(t => t.epmModel === epmModel);
}

export function getCategoriesWithTemplates(): BoxCategory[] {
  const catsWithItems = new Set(DIELINE_TEMPLATES.map(t => t.category));
  return BOX_CATEGORIES.filter(c => c.id === 'all' || catsWithItems.has(c.id));
}

export function getTemplatesSupporting3d(): DielineTemplate[] {
  return DIELINE_TEMPLATES.filter(t => t.supports3d);
}

