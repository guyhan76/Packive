import crypto from 'crypto';

export interface EpmApiConfig {
  username: string;
  password: string;
}

export interface EpmModelParams {
  L: string;
  W: string;
  D: string;
  Th: string;
  Units: string;
  H?: string;
  B?: string;
}

export interface EpmModelOptions {
  DimensionType?: 'In' | 'Crease' | 'Out';
  KnifeInfo?: boolean;
  GlueZone?: boolean;
  Sizes?: boolean;
  FullFlap?: boolean;
  Notch?: boolean;
  Lock?: boolean;
}

export interface EpmResponse {
  Status: 'Success' | 'Failed';
  ErrorCode: number;
  Details?: string;
  Model?: string;       // base64 PDF
  Preview?: string;      // base64 PNG preview
  ModelsCatalog?: any[];
  Sizes?: any;          // Flat dimensions from API
}

/**
 * Generate EasyPackMaker API token
 * Algorithm:
 * 1. Collect all request fields EXCEPT "Token"
 * 2. Add "Password" as a field with the API password value
 * 3. Sort all field keys alphabetically
 * 4. Concatenate the values in sorted key order
 * 5. SHA-256 hash the result
 */
export function generateToken(
  fields: Record<string, any>,
  password: string
): string {
  // Remove Token if present, add Password
  const allFields: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(fields)) {
    if (key === 'Token') continue;
    // Only include top-level string/number values (not objects)
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      allFields[key] = String(value);
    }
  }
  allFields['Password'] = password;

  // Sort keys alphabetically
  const sortedKeys = Object.keys(allFields).sort();
  
  // Concatenate values
  const raw = sortedKeys.map(k => allFields[k]).join('');
  
  // SHA-256
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

/**
 * Call EasyPackMaker API
 */
export async function callEpmApi(
  config: EpmApiConfig,
  requestBody: Record<string, any>
): Promise<EpmResponse> {
  const fields = { ...requestBody, UserName: config.username };
  const token = generateToken(fields, config.password);
  
  const body = {
    ...fields,
    Token: token,
  };

  const response = await fetch('https://easypackmaker.com/generator/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`EasyPackMaker API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get full template catalog
 */
export async function getEpmCatalog(config: EpmApiConfig): Promise<EpmResponse> {
  return callEpmApi(config, { GetCatalog: 'all' });
}

/**
 * Generate a dieline model
 */
export async function generateModel(
  config: EpmApiConfig,
  modelName: string,
  params: EpmModelParams,
  options?: EpmModelOptions,
  orderId?: string
): Promise<EpmResponse> {
  const body: Record<string, any> = {
    ModelName: modelName,
    OrderId: orderId || `packive_${Date.now()}`,
    ModelParams: params,
  };

  if (options) {
    body.ModelOptions = options;
  }

  return callEpmApi(config, body);
}

/**
 * Decode base64 PDF to Buffer
 */
export function decodePdf(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}
