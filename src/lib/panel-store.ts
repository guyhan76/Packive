interface PanelData {
  canvasJSON: string | null
  thumbnail: string | null
  isDesigned: boolean
}

interface PanelStore {
  [key: string]: PanelData
}

let store: PanelStore = {
  panel1: { canvasJSON: null, thumbnail: null, isDesigned: false },
  panel2: { canvasJSON: null, thumbnail: null, isDesigned: false },
  panel3: { canvasJSON: null, thumbnail: null, isDesigned: false },
  panel4: { canvasJSON: null, thumbnail: null, isDesigned: false },
}

export function savePanelDesign(panelId: string, canvasJSON: string, thumbnail: string) {
  store[panelId] = { canvasJSON, thumbnail, isDesigned: true }
}

export function loadPanelDesign(panelId: string): { canvasJSON: string | null; thumbnail: string | null } {
  const d = store[panelId]
  return d ? { canvasJSON: d.canvasJSON, thumbnail: d.thumbnail } : { canvasJSON: null, thumbnail: null }
}

export function isPanelDesigned(panelId: string): boolean {
  return store[panelId]?.isDesigned ?? false
}

export function getDesignedPanelCount(): number {
  return Object.values(store).filter(d => d.isDesigned).length
}

export function getAllPanelThumbnails(): Record<string, string | null> {
  const out: Record<string, string | null> = {}
  for (const k of Object.keys(store)) out[k] = store[k].thumbnail
  return out
}

export function resetAllPanels(): void {
  for (const k of Object.keys(store)) {
    store[k] = { canvasJSON: null, thumbnail: null, isDesigned: false }
  }
}
