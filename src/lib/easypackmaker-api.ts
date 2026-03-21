// EasyPackMaker API Service
// Endpoint: POST https://easypackmaker.com/generator/api
// Auth: SHA-256 token from sorted params + password

import crypto from 'crypto';

export interface EpmApiConfig {
  userName: string;
  password: string;
}

export interface EpmModelParams {
  L: string;
  W: string;
  D: string;
  Th: string;
  Units: string;
}

export interface EpmModelOptions {
  DimensionType?: 'In' | 'Out' | 'Crease';
  FluteDir?: 'Vertical' | 'Horizontal';
  KnifeInfo?: boolean;
  GlueZone?: boolean;
  Sizes?: boolean;
  GlueFlapCorr?: boolean;
  LinesColors?: {
    cutColor?: string;
    creaseColor?: string;
    perforationColor?: string;
    zipperColor?: string;
    infoColor?: string;
  };
}

export interface EpmRequest {
  UserName: string;
  Token: string;
  OrderId: string;
  ModelName?: string;
  ModelId?: string;
  PreviewOnly?: boolean;
  SizesOnly?: boolean;
  ModelParams?: EpmModelParams | null;
  ModelOptions?: EpmModelOptions;
  GetCatalog?: string;
}

export interface EpmResponse {
  Status: number;
  StatusMessage?: string;
  ModelData?: string;       // base64 PDF
  ModelPreview?: string | string[];  // base64 PNG
  ModelDescription?: any;
  ErrorMessage?: string;
}

/**
 * Generate SHA-256 token for EasyPackMaker API
 * 1. Collect all request params (excluding Token)
 * 2. Sort by key alphabetically
 * 3. Concatenate values
 * 4. SHA-256 hash
 */
export function generateToken(params: Record<string, any>, password: string): string {
  // Flatten nested objects for token generation
  const flat: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (key === 'Token') continue;
    if (value === null || value === undefined) continue;

    if (typeof value === 'object' && !Array.isArray(value)) {
      // For nested objects (ModelParams, ModelOptions), include each sub-key
      for (const [subKey, subVal] of Object.entries(value)) {
        if (subVal !== null && subVal !== undefined) {
          flat[subKey] = String(subVal);
        }
      }
    } else {
      flat[key] = String(value);
    }
  }

  // Add password
  flat['Password'] = password;

  // Sort keys alphabetically
  const sortedKeys = Object.keys(flat).sort();

  // Concatenate values
  const concatenated = sortedKeys.map(k => flat[k]).join('');

  // SHA-256 hash
  const hash = crypto.createHash('sha256').update(concatenated).digest('hex');
  return hash;
}

/**
 * Call EasyPackMaker API
 */
export async function callEpmApi(
  config: EpmApiConfig,
  modelName: string,
  orderId: string,
  modelParams: EpmModelParams,
  modelOptions: EpmModelOptions = {},
  previewOnly: boolean = false
): Promise<EpmResponse> {
  const requestBody: Record<string, any> = {
    UserName: config.userName,
    OrderId: orderId,
    ModelName: modelName,
  };

  if (modelParams) requestBody.ModelParams = modelParams;
  if (Object.keys(modelOptions).length > 0) requestBody.ModelOptions = modelOptions;
  if (previewOnly) requestBody.PreviewOnly = true;

  // Generate token
  const token = generateToken(requestBody, config.password);
  requestBody.Token = token;

  const response = await fetch('https://easypackmaker.com/generator/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`EasyPackMaker API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get catalog of all available models
 */
export async function getEpmCatalog(config: EpmApiConfig): Promise<EpmResponse> {
  const requestBody: Record<string, any> = {
    UserName: config.userName,
    GetCatalog: 'all',
  };

  const token = generateToken(requestBody, config.password);
  requestBody.Token = token;

  const response = await fetch('https://easypackmaker.com/generator/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  return response.json();
}

/**
 * Decode base64 PDF data to Buffer
 */
export function decodePdf(base64Data: string): Buffer {
  return Buffer.from(base64Data, 'base64');
}