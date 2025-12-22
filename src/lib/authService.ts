import axiosInstance from './AxiosInstance';
import { apiRoutes } from './routes';

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
): Promise<void> {
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

  await axiosInstance.post(
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
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Transform server-provided options for WebAuthn API
 * Converts base64url strings to ArrayBuffers as required by WebAuthn
 */
export function transformOptionsForWebAuthn(
  options: any
): PublicKeyCredentialRequestOptions | PublicKeyCredentialCreationOptions {
  const transformed = { ...options };
  
  // Convert base64url strings to ArrayBuffers for challenge
  if (transformed.challenge && typeof transformed.challenge === 'string') {
    transformed.challenge = base64UrlToArrayBuffer(transformed.challenge);
  }

  // Convert user.id from base64/base64url string to ArrayBuffer (for registration)
  if (transformed.user && transformed.user.id && typeof transformed.user.id === 'string') {
    transformed.user = {
      ...transformed.user,
      id: base64UrlToArrayBuffer(transformed.user.id),
    };
  }

  // Convert allowCredentials ids from base64url to ArrayBuffer
  if (transformed.allowCredentials && Array.isArray(transformed.allowCredentials)) {
    transformed.allowCredentials = transformed.allowCredentials.map((cred: any) => ({
      ...cred,
      id: typeof cred.id === 'string' ? base64UrlToArrayBuffer(cred.id) : cred.id,
    }));
  }

  // Convert excludeCredentials ids from base64url to ArrayBuffer
  if (transformed.excludeCredentials && Array.isArray(transformed.excludeCredentials)) {
    transformed.excludeCredentials = transformed.excludeCredentials.map((cred: any) => ({
      ...cred,
      id: typeof cred.id === 'string' ? base64UrlToArrayBuffer(cred.id) : cred.id,
    }));
  }

  return transformed as PublicKeyCredentialRequestOptions | PublicKeyCredentialCreationOptions;
}

