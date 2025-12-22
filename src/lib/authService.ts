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
 * Convert hex string to ArrayBuffer
 */
export function hexStringToArrayBuffer(hexString: string): ArrayBuffer {
  // Remove any spaces or non-hex characters
  const cleanHex = hexString.replace(/[^0-9a-fA-F]/g, '');
  
  // Convert hex string to bytes
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  
  return bytes.buffer;
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
 * Convert base64/base64url string to ArrayBuffer, with special handling for user.id
 * which may be a base64-encoded hex string
 */
export function base64ToArrayBufferForUserId(base64String: string): ArrayBuffer {
  // First decode the base64 string
  const decoded = atob(base64String);
  
  // Check if the decoded string is a hex string (MongoDB ObjectId format)
  // Hex strings only contain 0-9, a-f, A-F
  const isHexString = /^[0-9a-fA-F]+$/.test(decoded);
  
  if (isHexString && decoded.length === 24) {
    // It's a MongoDB ObjectId in hex format - convert hex to bytes
    debugLogger.debug('Detected hex-encoded user.id, converting from hex', { hexString: decoded });
    return hexStringToArrayBuffer(decoded);
  } else {
    // It's already raw bytes
    debugLogger.debug('Using raw bytes for user.id', { byteLength: decoded.length });
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes.buffer;
  }
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
  
  // Use structuredClone if available for a truly deep clone (removes all shared references)
  let clonedOptions: any;
  if (typeof structuredClone !== 'undefined') {
    try {
      clonedOptions = structuredClone(options);
      debugLogger.debug('Used structuredClone for deep copy');
    } catch (e) {
      // structuredClone might fail on some objects, fallback to manual clone
      debugLogger.debug('structuredClone failed, using manual clone', { error: String(e) });
      clonedOptions = JSON.parse(JSON.stringify(options));
    }
  } else {
    clonedOptions = JSON.parse(JSON.stringify(options));
  }
  
  // Build a completely new object structure to avoid any mutation issues
  const transformed: any = {};
  
  // Copy primitive and simple properties
  if (clonedOptions.timeout !== undefined) transformed.timeout = clonedOptions.timeout;
  if (clonedOptions.attestation !== undefined) transformed.attestation = clonedOptions.attestation;
  if (clonedOptions.rpId !== undefined) transformed.rpId = clonedOptions.rpId;
  if (clonedOptions.userVerification !== undefined) transformed.userVerification = clonedOptions.userVerification;
  if (clonedOptions.hints !== undefined && Array.isArray(clonedOptions.hints)) {
    transformed.hints = [...clonedOptions.hints];
  }
  
  // Deep clone rp object
  if (clonedOptions.rp) {
    transformed.rp = {
      name: clonedOptions.rp.name,
      id: clonedOptions.rp.id,
    };
  }
  
  // Deep clone and convert user object (for registration)
  if (clonedOptions.user) {
    transformed.user = {
      name: clonedOptions.user.name,
      displayName: clonedOptions.user.displayName,
      id: typeof clonedOptions.user.id === 'string' 
        ? base64ToArrayBufferForUserId(clonedOptions.user.id)
        : clonedOptions.user.id,
    };
  }
  
  // Deep clone pubKeyCredParams array
  if (clonedOptions.pubKeyCredParams && Array.isArray(clonedOptions.pubKeyCredParams)) {
    transformed.pubKeyCredParams = clonedOptions.pubKeyCredParams.map((param: any) => ({
      alg: param.alg,
      type: param.type,
    }));
  }
  
  // Deep clone authenticatorSelection object
  if (clonedOptions.authenticatorSelection) {
    transformed.authenticatorSelection = {
      authenticatorAttachment: clonedOptions.authenticatorSelection.authenticatorAttachment,
      userVerification: clonedOptions.authenticatorSelection.userVerification,
      requireResidentKey: clonedOptions.authenticatorSelection.requireResidentKey,
      residentKey: clonedOptions.authenticatorSelection.residentKey,
    };
  }
  
  // Deep clone extensions object
  if (clonedOptions.extensions) {
    transformed.extensions = { ...clonedOptions.extensions };
  }
  
  // Convert challenge from base64url string to ArrayBuffer
  if (clonedOptions.challenge && typeof clonedOptions.challenge === 'string') {
    transformed.challenge = base64UrlToArrayBuffer(clonedOptions.challenge);
  } else if (clonedOptions.challenge) {
    transformed.challenge = clonedOptions.challenge;
  }

  // Deep clone and convert allowCredentials ids from base64url to ArrayBuffer
  if (clonedOptions.allowCredentials && Array.isArray(clonedOptions.allowCredentials)) {
    transformed.allowCredentials = clonedOptions.allowCredentials.map((cred: any) => {
      const newCred: any = {
        type: cred.type,
        id: typeof cred.id === 'string' ? base64UrlToArrayBuffer(cred.id) : cred.id,
      };
      if (cred.transports && Array.isArray(cred.transports)) {
        newCred.transports = [...cred.transports];
      }
      return newCred;
    });
  }

  // Deep clone and convert excludeCredentials ids from base64url to ArrayBuffer
  if (clonedOptions.excludeCredentials && Array.isArray(clonedOptions.excludeCredentials)) {
    debugLogger.debug('Processing excludeCredentials', { count: clonedOptions.excludeCredentials.length, credentials: clonedOptions.excludeCredentials });
    
    transformed.excludeCredentials = clonedOptions.excludeCredentials.map((cred: any, index: number) => {
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

