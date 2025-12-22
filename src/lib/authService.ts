import axiosInstance from './AxiosInstance';
import { apiRoutes } from './routes';
import { debugLogger } from './debugLogger';

// Types
export interface CheckLoginMethodsResponse {
  hasPasskeys: boolean;
}

export interface PasskeyLoginStartResponse {
  options: any; // Will be transformed to PublicKeyCredentialRequestOptions
  challengeKey: string;
}

export interface PasskeyLoginCompleteRequest {
  email: string;
  challengeKey: string;
  assertion: PublicKeyCredential;
}

export interface PasskeyLoginCompleteResponse {
  token: string;
  refreshToken: string;
  role: string;
}

export interface PasskeyRegistrationStartRequest {
  deviceName: string;
}

export interface PasskeyRegistrationStartResponse {
  options: any; // Will be transformed to PublicKeyCredentialCreationOptions
  challengeKey: string;
}

export interface PasskeyRegistrationCompleteRequest {
  challengeKey: string;
  attestation: PublicKeyCredential;
}

export interface PasskeyRegistrationCompleteResponse {
  message: string;
  credentialID?: string;
}

export interface PasskeyInfo {
  credentialId: string;  // Normalized to camelCase for frontend
  deviceName: string;
  createdAt: string;
  lastUsedAt?: string;
}

/**
 * Check if an email has passkeys registered
 */
export async function checkLoginMethods(
  email: string,
  turnstileToken: string | null
): Promise<CheckLoginMethodsResponse> {
  const requestBody: Record<string, string> = {
    email,
  };
  
  if (turnstileToken) {
    requestBody['cf-turnstile-response'] = turnstileToken;
  }

  const response = await axiosInstance.post(
    apiRoutes.checkLoginMethods,
    requestBody
  );
  
  return response.data;
}

/**
 * Start passkey login flow
 */
export async function startPasskeyLogin(
  email: string,
  turnstileToken: string | null
): Promise<PasskeyLoginStartResponse> {
  const requestBody: Record<string, string> = {
    email,
  };
  
  if (turnstileToken) {
    requestBody['cf-turnstile-response'] = turnstileToken;
  }

  const response = await axiosInstance.post(
    apiRoutes.passkey.login.start,
    requestBody
  );
  
  return response.data;
}

/**
 * Complete passkey login flow
 */
export async function completePasskeyLogin(
  data: PasskeyLoginCompleteRequest
): Promise<PasskeyLoginCompleteResponse> {
  // Type guard for AuthenticatorAssertionResponse
  const assertionResponse = data.assertion.response as AuthenticatorAssertionResponse;
  
  // Convert PublicKeyCredential to JSON-serializable format (base64url strings as per API spec)
  const assertionData = {
    id: data.assertion.id,
    rawId: arrayBufferToBase64Url(data.assertion.rawId),
    response: {
      clientDataJSON: arrayBufferToBase64Url(assertionResponse.clientDataJSON),
      authenticatorData: arrayBufferToBase64Url(assertionResponse.authenticatorData),
      signature: arrayBufferToBase64Url(assertionResponse.signature),
      userHandle: assertionResponse.userHandle 
        ? arrayBufferToBase64Url(assertionResponse.userHandle)
        : null,
    },
    type: data.assertion.type,
  };

  const response = await axiosInstance.post(
    apiRoutes.passkey.login.complete,
    {
      email: data.email,
      challengeKey: data.challengeKey,
      assertion: assertionData,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data;
}

/**
 * Get list of user's passkeys
 */
export async function getUserPasskeys(): Promise<PasskeyInfo[]> {
  const response = await axiosInstance.get(apiRoutes.passkey.list);
  // API returns { passkeys: [...] }, extract the array
  const passkeys = response.data.passkeys || response.data || [];
  
  // Normalize credentialID (API format) to credentialId (frontend format)
  return passkeys.map((passkey: any) => ({
    ...passkey,
    credentialId: passkey.credentialID || passkey.credentialId,
  }));
}

/**
 * Start passkey registration flow
 */
export async function startPasskeyRegistration(
  deviceName: string
): Promise<PasskeyRegistrationStartResponse> {
  const response = await axiosInstance.post(
    apiRoutes.passkey.register.start,
    { deviceName },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data;
}

/**
 * Complete passkey registration flow
 */
export async function completePasskeyRegistration(
  data: PasskeyRegistrationCompleteRequest
): Promise<PasskeyRegistrationCompleteResponse> {
  // Type guard for AuthenticatorAttestationResponse
  const attestationResponse = data.attestation.response as AuthenticatorAttestationResponse;
  
  // Convert PublicKeyCredential to JSON-serializable format (base64url strings as per API spec)
  const attestationData = {
    id: data.attestation.id,
    rawId: arrayBufferToBase64Url(data.attestation.rawId),
    response: {
      clientDataJSON: arrayBufferToBase64Url(attestationResponse.clientDataJSON),
      attestationObject: arrayBufferToBase64Url(attestationResponse.attestationObject),
    },
    type: data.attestation.type,
  };

  const response = await axiosInstance.post(
    apiRoutes.passkey.register.complete,
    {
      challengeKey: data.challengeKey,
      attestation: attestationData,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data;
}

/**
 * Delete a passkey
 */
export async function deletePasskey(credentialId: string): Promise<void> {
  await axiosInstance.delete(apiRoutes.passkey.delete(credentialId));
}

/**
 * Check if WebAuthn is supported in the browser
 */
export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.PublicKeyCredential !== 'undefined';
}

/**
 * Convert array buffer to base64url string (for WebAuthn)
 */
export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Convert base64url string to array buffer (for WebAuthn)
 */
export function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  // Convert base64url to base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
    }
    base64 += new Array(5 - pad).join('=');
  }
  
  // Decode base64 to binary string
  const binary = atob(base64);
  
  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  // Return the ArrayBuffer (not a view, but the actual buffer)
  return bytes.buffer;
}

/**
 * Transform server-provided options for WebAuthn API
 * Converts base64url strings to ArrayBuffers as required by WebAuthn
 * Builds a completely new object to avoid any mutation issues
 */
export function transformOptionsForWebAuthn(
  options: any
): PublicKeyCredentialRequestOptions | PublicKeyCredentialCreationOptions {
  debugLogger.info('Starting transformation of WebAuthn options', { originalOptions: options });
  // Build a completely new object structure to avoid any mutation issues
  const transformed: any = {};
  
  // Copy primitive and simple properties
  if (options.timeout !== undefined) transformed.timeout = options.timeout;
  if (options.attestation !== undefined) transformed.attestation = options.attestation;
  if (options.hints !== undefined && Array.isArray(options.hints)) {
    transformed.hints = [...options.hints];
  }
  
  // Deep clone rp object
  if (options.rp) {
    transformed.rp = { ...options.rp };
  }
  
  // Deep clone and convert user object (for registration)
  if (options.user) {
    transformed.user = {
      ...options.user,
      id: typeof options.user.id === 'string' 
        ? base64UrlToArrayBuffer(options.user.id)
        : options.user.id,
    };
  }
  
  // Deep clone pubKeyCredParams array
  if (options.pubKeyCredParams && Array.isArray(options.pubKeyCredParams)) {
    transformed.pubKeyCredParams = options.pubKeyCredParams.map((param: any) => ({ ...param }));
  }
  
  // Deep clone authenticatorSelection object
  if (options.authenticatorSelection) {
    transformed.authenticatorSelection = { ...options.authenticatorSelection };
  }
  
  // Deep clone extensions object
  if (options.extensions) {
    transformed.extensions = { ...options.extensions };
  }
  
  // Convert challenge from base64url string to ArrayBuffer
  if (options.challenge && typeof options.challenge === 'string') {
    transformed.challenge = base64UrlToArrayBuffer(options.challenge);
  } else if (options.challenge) {
    transformed.challenge = options.challenge;
  }

  // Deep clone and convert allowCredentials ids from base64url to ArrayBuffer
  if (options.allowCredentials && Array.isArray(options.allowCredentials)) {
    transformed.allowCredentials = options.allowCredentials.map((cred: any) => ({
      ...cred,
      id: typeof cred.id === 'string' ? base64UrlToArrayBuffer(cred.id) : cred.id,
    }));
  }

  // Deep clone and convert excludeCredentials ids from base64url to ArrayBuffer
  if (options.excludeCredentials && Array.isArray(options.excludeCredentials)) {
    debugLogger.debug('Processing excludeCredentials', { count: options.excludeCredentials.length, credentials: options.excludeCredentials });
    
    transformed.excludeCredentials = options.excludeCredentials.map((cred: any, index: number) => {
      debugLogger.debug(`Converting credential ${index}`, { credential: cred });
      
      const newCred: any = {
        type: cred.type,
        id: typeof cred.id === 'string' ? base64UrlToArrayBuffer(cred.id) : cred.id,
      };
      
      debugLogger.debug(`Converted credential ${index}`, { convertedId: newCred.id });
      
      // Preserve transports if present
      if (cred.transports && Array.isArray(cred.transports)) {
        newCred.transports = [...cred.transports];
      }
      return newCred;
    });
    
    debugLogger.debug('Final excludeCredentials', { excludeCredentials: transformed.excludeCredentials });
  }

  debugLogger.info('Transformation complete', { transformedOptions: transformed });
  return transformed as PublicKeyCredentialRequestOptions | PublicKeyCredentialCreationOptions;
}

