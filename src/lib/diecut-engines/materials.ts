export type MaterialCategory = 'white-cardboard' | 'kraft-paperboard' | 'single-flute' | 'double-flute'

export interface MaterialSpec {
  id: string
  name: string
  category: MaterialCategory
  categoryLabel: string
  thickness: number       // thickness offset in mm
  paperThickness: number  // actual paper thickness in mm (for API)
  glueFlap: number
  tuckLength: number
  glueFlapLarge?: number
}

export const MATERIALS: MaterialSpec[] = [
  // White Cardboard
  { id: 'white-350', name: '350 GSM', category: 'white-cardboard', categoryLabel: 'White Cardboard', thickness: 0.5, paperThickness: 0.45, glueFlap: 15, tuckLength: 15 },
  { id: 'white-400', name: '400 GSM', category: 'white-cardboard', categoryLabel: 'White Cardboard', thickness: 0.5, paperThickness: 0.52, glueFlap: 15, tuckLength: 15 },
  { id: 'white-450', name: '450 GSM', category: 'white-cardboard', categoryLabel: 'White Cardboard', thickness: 0.5, paperThickness: 0.58, glueFlap: 15, tuckLength: 15 },

  // Kraft Paperboard
  { id: 'kraft-350', name: '350 GSM', category: 'kraft-paperboard', categoryLabel: 'Kraft Paperboard', thickness: 0.5, paperThickness: 0.45, glueFlap: 15, tuckLength: 15 },
  { id: 'kraft-400', name: '400 GSM', category: 'kraft-paperboard', categoryLabel: 'Kraft Paperboard', thickness: 0.5, paperThickness: 0.52, glueFlap: 15, tuckLength: 15 },

  // Corrugated - Single Flute (SW)
  { id: 'g-flute', name: 'G-Flute', category: 'single-flute', categoryLabel: 'Single Flute (SW)', thickness: 1.0, paperThickness: 1.0, glueFlap: 25, tuckLength: 25, glueFlapLarge: 30 },
  { id: 'f-flute', name: 'F-Flute', category: 'single-flute', categoryLabel: 'Single Flute (SW)', thickness: 1.0, paperThickness: 1.0, glueFlap: 25, tuckLength: 25, glueFlapLarge: 30 },
  { id: 'e-flute', name: 'E-Flute', category: 'single-flute', categoryLabel: 'Single Flute (SW)', thickness: 1.0, paperThickness: 1.5, glueFlap: 25, tuckLength: 25, glueFlapLarge: 30 },
  { id: 'b-flute', name: 'B-Flute', category: 'single-flute', categoryLabel: 'Single Flute (SW)', thickness: 1.5, paperThickness: 3.0, glueFlap: 25, tuckLength: 25, glueFlapLarge: 30 },
  { id: 'c-flute', name: 'C-Flute', category: 'single-flute', categoryLabel: 'Single Flute (SW)', thickness: 2.0, paperThickness: 4.0, glueFlap: 30, tuckLength: 30 },
  { id: 'a-flute', name: 'A-Flute', category: 'single-flute', categoryLabel: 'Single Flute (SW)', thickness: 2.5, paperThickness: 5.0, glueFlap: 30, tuckLength: 30 },

  // Corrugated - Double Flute (DW)
  { id: 'eb-flute', name: 'EB-Flute', category: 'double-flute', categoryLabel: 'Double Flute (DW)', thickness: 2.5, paperThickness: 4.5, glueFlap: 35, tuckLength: 35 },
  { id: 'cb-flute', name: 'CB-Flute', category: 'double-flute', categoryLabel: 'Double Flute (DW)', thickness: 3.0, paperThickness: 7.0, glueFlap: 35, tuckLength: 35 },
  { id: 'bb-flute', name: 'BB-Flute', category: 'double-flute', categoryLabel: 'Double Flute (DW)', thickness: 3.5, paperThickness: 6.0, glueFlap: 35, tuckLength: 35 },
  { id: 'ba-flute', name: 'BA-Flute', category: 'double-flute', categoryLabel: 'Double Flute (DW)', thickness: 4.0, paperThickness: 9.0, glueFlap: 35, tuckLength: 35 },
]

export function getGlueFlapWidth(material: MaterialSpec, length: number, width: number): number {
  if (material.glueFlapLarge && (length + width) * 2 >= 1000) {
    return material.glueFlapLarge
  }
  return material.glueFlap
}

export function getDustFlapLength(width: number): number {
  return width / 2
}

export const BLEED = {
  standard: 5,
  glueFlap: 10,
}
