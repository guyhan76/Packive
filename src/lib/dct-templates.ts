/**
 * Die Cut Templates - FEFCO/ECMA to DCT template ID mapping
 * Template IDs from https://www.diecuttemplates.com/dielines
 */

export interface DctTemplateMapping {
  /** Display code, e.g. "FEFCO 0201" */
  code: string;
  /** DCT template ID, e.g. "becf-21d0a" */
  dctId: string;
  /** Description */
  name: string;
  /** Category */
  category: 'corrugated' | 'carton';
  /** Group */
  group: string;
  /** Supports 3D mockup */
  has3d: boolean;
  /** FEFCO or ECMA standard */
  standard: 'FEFCO' | 'ECMA';
}

/**
 * Mapping table: Packive box codes → DCT template IDs
 * Using newest variants where available (better flap/tuck detail)
 */
export const DCT_TEMPLATE_MAP: DctTemplateMapping[] = [
  // === FEFCO - Standard Boxes (Corrugated Cardboards) ===
  { code: 'FEFCO 0201', dctId: 'becf-21d0a', name: 'Regular Slotted Container (RSC)', category: 'corrugated', group: 'Standard Boxes', has3d: true, standard: 'FEFCO' },
  { code: 'FEFCO 0203', dctId: 'becf-21d03', name: 'Full Overlap Slotted Container', category: 'corrugated', group: 'Standard Boxes', has3d: true, standard: 'FEFCO' },
  { code: 'FEFCO 0225', dctId: 'becf-21e01', name: 'Centre Special Slotted Container', category: 'corrugated', group: 'Standard Boxes', has3d: true, standard: 'FEFCO' },
  { code: 'FEFCO 0470', dctId: 'becf-21e03', name: 'Folder with Cover', category: 'corrugated', group: 'Standard Boxes', has3d: true, standard: 'FEFCO' },
  { code: 'FEFCO 0471', dctId: 'becf-21e02', name: 'Folder with Partial Cover', category: 'corrugated', group: 'Standard Boxes', has3d: true, standard: 'FEFCO' },

  // TODO: Add more FEFCO types as DCT template IDs are discovered
  // Phase 1-1 expansion: Tuck End, Snap Lock, Tray, etc.
];

/**
 * Look up DCT template ID from Packive box code
 */
export function getDctTemplateId(boxCode: string): string | null {
  const entry = DCT_TEMPLATE_MAP.find(
    (m) => m.code.toLowerCase() === boxCode.toLowerCase()
  );
  return entry?.dctId || null;
}

/**
 * Check if a box code supports 3D mockup
 */
export function supports3dMockup(boxCode: string): boolean {
  const entry = DCT_TEMPLATE_MAP.find(
    (m) => m.code.toLowerCase() === boxCode.toLowerCase()
  );
  return entry?.has3d ?? false;
}

/**
 * Get all available templates
 */
export function getAllDctTemplates(): DctTemplateMapping[] {
  return DCT_TEMPLATE_MAP;
}

/**
 * Convert Packive modelName format to box code
 * e.g., "fefco_0201" → "FEFCO 0201", "A0110" → "ECMA A0110"
 */
export function modelNameToBoxCode(modelName: string): string {
  if (modelName.startsWith('fefco_')) {
    return 'FEFCO ' + modelName.replace('fefco_', '');
  }
  if (/^[A-Z]\d{4}/.test(modelName)) {
    return 'ECMA ' + modelName;
  }
  return modelName;
}
