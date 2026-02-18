// Boxshot Dielines API Integration
// API Docs: https://dielines.boxshot.com/api/
// Free: collections, dielines list, parameters, preview (PNG)
// Paid ($99/mo): EPS/JSON/ZIP generation

const API_BASE = 'https://dielines.boxshot.com'

export interface DielineParam {
  name: string
  type: 'length' | 'option' | 'bool'
  value: number | string | boolean
  min?: number
  max?: number
  options?: string[]
}

export interface DielineInfo {
  id: string
  name: string
  description: string
  collection?: string
}

// Get all available dielines
export async function getDielines(): Promise<DielineInfo[]> {
  const res = await fetch(`${API_BASE}/dielines`)
  if (!res.ok) throw new Error('Failed to fetch dielines')
  return res.json()
}

// Get dielines by collection (FEFCO or ECMA)
export async function getDielinesByCollection(collection: string): Promise<DielineInfo[]> {
  const res = await fetch(`${API_BASE}/collections/${collection}/dielines`)
  if (!res.ok) throw new Error(`Failed to fetch ${collection} dielines`)
  return res.json()
}

// Get parameters for a specific dieline
export async function getDielineParams(id: string): Promise<DielineParam[]> {
  const res = await fetch(`${API_BASE}/dielines/${id}/vars2`)
  if (!res.ok) throw new Error(`Failed to fetch params for ${id}`)
  return res.json()
}

// Generate preview URL (free, returns PNG image URL)
export function getDielinePreviewUrl(id: string, params: Record<string, string | number | boolean>): string {
  const query = Object.entries(params)
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`)
    .join('&')
  return `${API_BASE}/dielines/${id}/preview?${query}`
}

// Convert mm to points (Boxshot API uses points: 1 point = 0.352778 mm, 1 mm = 2.83465 points)
export function mmToPoints(mm: number): number {
  return mm * 2.83465
}

// Convert points to mm
export function pointsToMm(points: number): number {
  return points / 2.83465
}
