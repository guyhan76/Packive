/**
 * Recraft V4 Vector API Client
 * 
 * Services:
 *   - Vector Generation (V4/V4 Pro) - $0.08/$0.30 per image
 *   - Image Vectorization - $0.01 per request
 *   - Background Removal - $0.01 per request
 *   - Credits Check - free
 * 
 * API Docs: https://www.recraft.ai/docs/api-reference/endpoints
 */

const RECRAFT_BASE = "https://external.api.recraft.ai/v1";

export interface RecraftConfig {
  token: string;
}

export interface GenerateVectorParams {
  prompt: string;
  model?: "recraftv4_vector" | "recraftv4_pro_vector";
  size?: string;
  n?: number;
  style?: string;
  colors?: Array<{ rgb: [number, number, number] }>;
  responseFormat?: "url" | "b64_json";
}

export interface RecraftImageResult {
  url: string;
  b64?: string;
}

export interface RecraftCredits {
  credits: number;
  email: string;
  id: string;
}

export const RECRAFT_STYLES = [
  { id: "vector_illustration", label: "Vector Illustration", icon: "🎨" },
  { id: "digital_illustration", label: "Digital Illustration", icon: "✏️" },
  { id: "icon", label: "Icon", icon: "⬡" },
  { id: "realistic_image", label: "Realistic", icon: "📷" },
] as const;

export const PACKAGING_PRESETS = [
  {
    id: "floral",
    label: "Floral Pattern",
    prompt: "elegant floral seamless pattern for luxury packaging, delicate botanical illustration, vector style",
    category: "pattern",
  },
  {
    id: "geometric",
    label: "Geometric Pattern",
    prompt: "modern geometric seamless pattern for packaging design, clean minimal lines, contemporary style",
    category: "pattern",
  },
  {
    id: "luxury-gold",
    label: "Luxury Gold",
    prompt: "luxury gold ornamental decoration for premium packaging, elegant baroque style vector illustration",
    category: "illustration",
  },
  {
    id: "organic",
    label: "Organic Natural",
    prompt: "organic natural leaf pattern for eco-friendly packaging, green botanical vector illustration",
    category: "pattern",
  },
  {
    id: "minimal-icon",
    label: "Minimal Icons",
    prompt: "set of minimal line icons for product packaging, clean simple vector icons, monoline style",
    category: "icon",
  },
  {
    id: "wave",
    label: "Wave Pattern",
    prompt: "abstract wave pattern for modern packaging, flowing curves, elegant minimal vector design",
    category: "pattern",
  },
  {
    id: "food-illust",
    label: "Food Illustration",
    prompt: "hand-drawn food illustration for packaging label, appetizing vector artwork, artisan style",
    category: "illustration",
  },
  {
    id: "korean-traditional",
    label: "Korean Traditional",
    prompt: "Korean traditional pattern (dancheong style) for packaging, elegant oriental vector ornament",
    category: "pattern",
  },
] as const;

export const UNIT_COSTS = {
  recraftv4_vector: 80,
  recraftv4_pro_vector: 300,
  vectorize: 10,
  remove_bg: 10,
} as const;

function getHeaders(token: string, json = true): Record<string, string> {
  const h: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

/** Generate vector SVG from text prompt */
export async function generateVector(
  config: RecraftConfig,
  params: GenerateVectorParams
): Promise<RecraftImageResult[]> {
  const body: Record<string, unknown> = {
    prompt: params.prompt,
    model: params.model || "recraftv4_vector",
    n: params.n || 1,
    size: params.size || "1024x1024",
    response_format: params.responseFormat || "url",
  };

  if (params.style) body.style = params.style;
  if (params.colors?.length) body.controls = { colors: params.colors };

  const resp = await fetch(`${RECRAFT_BASE}/images/generations`, {
    method: "POST",
    headers: getHeaders(config.token),
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Recraft generate failed (${resp.status}): ${err}`);
  }

  const data = await resp.json();
  return data.data.map((d: { url?: string; b64_json?: string }) => ({
    url: d.url || "",
    b64: d.b64_json || "",
  }));
}

/** Convert raster image to SVG vector */
export async function vectorizeImage(
  config: RecraftConfig,
  imageBuffer: Buffer,
  fileName: string
): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: "image/png" });
  formData.append("file", blob, fileName);

  const resp = await fetch(`${RECRAFT_BASE}/images/vectorize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}` },
    body: formData,
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Recraft vectorize failed (${resp.status}): ${err}`);
  }

  const data = await resp.json();
  return data.image.url;
}

/** Remove background from raster image */
export async function removeBackground(
  config: RecraftConfig,
  imageBuffer: Buffer,
  fileName: string
): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: "image/png" });
  formData.append("file", blob, fileName);

  const resp = await fetch(`${RECRAFT_BASE}/images/removeBackground`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}` },
    body: formData,
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Recraft remove-bg failed (${resp.status}): ${err}`);
  }

  const data = await resp.json();
  return data.image.url;
}

/** Get current API credits balance */
export async function getCredits(config: RecraftConfig): Promise<RecraftCredits> {
  const resp = await fetch(`${RECRAFT_BASE}/users/me`, {
    method: "GET",
    headers: getHeaders(config.token, false),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Recraft credits check failed (${resp.status}): ${err}`);
  }

  return resp.json();
}

/** Fetch SVG content from Recraft URL */
export async function fetchSvgContent(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch SVG: ${resp.status}`);
  return resp.text();
}