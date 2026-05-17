/**
 * Die Cut Templates API Client
 * https://www.diecuttemplates.com/docs/introduction
 */

export interface DctConfig {
  apiKey: string;
  useSandbox?: boolean;
}

export interface DctDielineVariables {
  unit: 'mm' | 'in';
  material: number;
  length: number;
  width: number;
  height: number;
  dimension_type?: 'external' | 'internal';
  direction?: boolean;
  cross?: boolean;
  glue_flap?: number;
  printing_method?: 'offset' | 'flexo';
  dimension_texts?: boolean;
  [key: string]: unknown;
}

export interface DctDieline {
  type: string;
  id: string;
  dieline_template_id: string;
  variables: DctDielineVariables;
  format: string;
  url: string;
  artwork_dimensions: {
    unit: string;
    width: string;
    height: string;
  };
  area?: {
    value: number;
    unit: string;
  };
  links: Array<{ rel: string; href: string; method: string }>;
  created_at: string;
}

export interface DctTemplate {
  type: string;
  id: string;
  group: {
    type: string;
    id: string;
    name: string;
    category: string;
  };
  flap?: { type: string; id: string; image: string };
  tuck?: { type: string; id: string; image: string };
  dust_flap?: { type: string; id: string; image: string };
  variables: Array<{
    type: string;
    name: string;
    description: string;
    data_type: string;
    required: boolean;
    allowed_values?: unknown[];
    default_value?: { value: unknown; unit?: string };
    image?: { type: string; url: string };
  }>;
  images: Array<{ type: string; url: string }>;
}

export interface Dct3dMockup {
  type: string;
  id: string;
  url: string;
  name?: string;
  dieline: DctDieline;
  links: Array<{ rel: string; href: string; method: string }>;
}

function getBaseUrl(config: DctConfig): string {
  return config.useSandbox
    ? 'https://sandbox.api.diecuttemplates.com'
    : 'https://api.diecuttemplates.com';
}

function getHeaders(config: DctConfig): Record<string, string> {
  return {
    'Authorization': `Bearer ${config.apiKey}`,
    'Dielines-Api-Version': '1.0',
    'Content-Type': 'application/json',
  };
}

/** Get template info */
export async function getTemplate(
  config: DctConfig,
  templateId: string,
  unit: 'mm' | 'in' = 'mm'
): Promise<DctTemplate> {
  const url = `${getBaseUrl(config)}/dieline-templates/${unit}/${templateId}`;
  const res = await fetch(url, { headers: getHeaders(config) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`DCT getTemplate failed: ${res.status} - ${err.message || res.statusText}`);
  }
  const data = await res.json();
  return data.dieline_template;
}

/** Generate a custom dieline */
export async function generateDieline(
  config: DctConfig,
  templateId: string,
  format: 'svg' | 'pdf' | 'dxf',
  variables: DctDielineVariables
): Promise<DctDieline> {
  const url = `${getBaseUrl(config)}/dieline-templates/${templateId}/dielines`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(config),
    body: JSON.stringify({ format, variables }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const details = err.errors?.map((e: any) => e.message).join('; ') || '';
    throw new Error(`DCT generateDieline failed: ${res.status} - ${err.message || res.statusText}${details ? ` (${details})` : ''}`);
  }
  const data = await res.json();
  return data.dieline;
}

/** Download dieline content (SVG string, PDF buffer, etc.) */
export async function downloadDieline(dieline: DctDieline): Promise<string> {
  const res = await fetch(dieline.url);
  if (!res.ok) throw new Error(`Failed to download dieline: ${res.status}`);
  return await res.text();
}

/** Create 3D mockup by uploading artwork */
export async function create3dMockup(
  config: DctConfig,
  dielineId: string,
  artworkBuffer: Buffer,
  artworkFilename: string,
  options?: { name?: string; outside_design?: boolean }
): Promise<Dct3dMockup> {
  const url = `${getBaseUrl(config)}/dielines/${dielineId}/3d-mockups`;
  
  // Build multipart form data
  const boundary = `----FormBoundary${Date.now()}`;
  const contentType = artworkFilename.endsWith('.png') ? 'image/png'
    : artworkFilename.endsWith('.svg') ? 'image/svg+xml'
    : artworkFilename.endsWith('.jpg') || artworkFilename.endsWith('.jpeg') ? 'image/jpeg'
    : 'application/octet-stream';

  const parts: Buffer[] = [];
  
  // File part
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${artworkFilename}"\r\nContent-Type: ${contentType}\r\n\r\n`
  ));
  parts.push(artworkBuffer);
  
  // Name part
  if (options?.name) {
    parts.push(Buffer.from(
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\n${options.name}`
    ));
  }
  
  // Outside design part
  parts.push(Buffer.from(
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="outside_design"\r\n\r\n${options?.outside_design !== false ? 'true' : 'false'}`
  ));
  
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
  
  const body = Buffer.concat(parts);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Dielines-Api-Version': '1.0',
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`DCT 3D mockup failed: ${res.status} - ${err.message || res.statusText}`);
  }
  const data = await res.json();
  return data['3d_mockup'];
}
