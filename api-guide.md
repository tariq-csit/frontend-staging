# Passkey Authentication API Documentation

Complete request/response examples for all passkey-related endpoints.

## Base URL
All endpoints are under: `/api/auth`

---

## Table of Contents
1. [Check Login Methods](#1-check-login-methods)
2. [Passkey Login - Start](#2-passkey-login---start)
3. [Passkey Login - Complete](#3-passkey-login---complete)
4. [Passkey Registration - Start](#4-passkey-registration---start)
5. [Passkey Registration - Complete](#5-passkey-registration---complete)
6. [Get User's Passkeys](#6-get-users-passkeys)
7. [Delete Passkey](#7-delete-passkey)
8. [Password Login (with hasPasskeys flag)](#8-password-login-with-haspasskeys-flag)

---

## 1. Check Login Methods

**Endpoint:** `POST /api/auth/check-login-methods`  
**Auth:** Public (requires Turnstile)  
**Purpose:** Check if an email has passkeys available before showing login UI

### Request
```http
POST /api/auth/check-login-methods
Content-Type: application/json
cf-turnstile-response: 0.abcdefghijklmnopqrstuvwxyz123456789

{
  "email": "user@example.com"
}
```

### Success Response (200) - Has Passkeys
```json
{
  "hasPasskeys": true
}
```

### Success Response (200) - No Passkeys
```json
{
  "hasPasskeys": false
}
```

### Error Responses

#### 400 - Missing Email
```json
{
  "message": "Email is required"
}
```

#### 400 - Invalid Turnstile Token
```json
{
  "message": "Invalid Turnstile token"
}
```

#### 500 - Server Error
```json
{
  "message": "Error checking login methods"
}
```

---

## 2. Passkey Login - Start

**Endpoint:** `POST /api/auth/passkey/login/start`  
**Auth:** Public (requires Turnstile)  
**Purpose:** Generate authentication challenge for passkey login

### Request
```http
POST /api/auth/passkey/login/start
Content-Type: application/json
cf-turnstile-response: 0.abcdefghijklmnopqrstuvwxyz123456789

{
  "email": "user@example.com"
}
```

### Success Response (200)
```json
{
  "options": {
    "challenge": "randomBase64URLString123456789abcdefghijklmnopqrstuvwxyz",
    "timeout": 60000,
    "rpId": "securitywall.co",
    "allowCredentials": [
      {
        "id": "base64urlEncodedCredentialID123456789abcdefghijklmnopqrstuvwxyz",
        "type": "public-key",
        "transports": ["internal", "hybrid"]
      },
      {
        "id": "anotherBase64urlEncodedCredentialID987654321zyxwvutsrqponmlkjihgfedcba",
        "type": "public-key",
        "transports": ["internal", "hybrid"]
      }
    ],
    "userVerification": "preferred"
  },
  "challengeKey": "auth:507f1f77bcf86cd799439011:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
}
```

### Error Responses

#### 400 - Missing Email
```json
{
  "message": "Email is required"
}
```

#### 400 - Invalid Email Format
```json
{
  "message": "Invalid email format"
}
```

#### 400 - No Passkeys Registered
```json
{
  "message": "No passkeys registered for this account. Please use password login."
}
```

#### 401 - User Not Found (Generic Error)
```json
{
  "message": "Invalid credentials"
}
```

#### 403 - Account Deactivated
```json
{
  "message": "Your account has been deactivated"
}
```

#### 400 - Invalid Turnstile Token
```json
{
  "message": "Invalid Turnstile token"
}
```

#### 500 - Server Error
```json
{
  "message": "Error starting passkey login"
}
```

---

## 3. Passkey Login - Complete

**Endpoint:** `POST /api/auth/passkey/login/complete`  
**Auth:** Public  
**Purpose:** Verify passkey authentication and return JWT tokens

### Request
```http
POST /api/auth/passkey/login/complete
Content-Type: application/json

{
  "email": "user@example.com",
  "challengeKey": "auth:507f1f77bcf86cd799439011:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "assertion": {
    "id": "base64urlEncodedCredentialID123456789abcdefghijklmnopqrstuvwxyz",
    "rawId": "base64urlEncodedCredentialID123456789abcdefghijklmnopqrstuvwxyz",
    "response": {
      "authenticatorData": "base64urlEncodedAuthenticatorDataString123456789abcdefghijklmnopqrstuvwxyz",
      "clientDataJSON": "base64urlEncodedClientDataJSONString123456789abcdefghijklmnopqrstuvwxyz",
      "signature": "base64urlEncodedSignatureString123456789abcdefghijklmnopqrstuvwxyz",
      "userHandle": null
    },
    "type": "public-key"
  }
}
```

### Success Response (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJjbGllbnQiLCJ0d29GYWN0b3JBdXRoZW50aWNhdGVkIjp0cnVlLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA0ODAwMH0.signature",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMTcyODAwfQ.signature",
  "role": "client",
  "message": "Login successful"
}
```

### Error Responses

#### 400 - Missing Required Fields
```json
{
  "message": "Email, challenge key, and assertion are required"
}
```

#### 400 - Invalid or Expired Challenge
```json
{
  "message": "Invalid or expired challenge"
}
```

#### 400 - Challenge Mismatch
```json
{
  "message": "Challenge does not match email"
}
```

#### 400 - Passkey Not Found
```json
{
  "message": "Passkey not found"
}
```

#### 400 - Passkey Verification Failed
```json
{
  "message": "Passkey verification failed: Invalid signature"
}
```

#### 500 - Server Error
```json
{
  "message": "Error completing passkey login"
}
```

---

## 4. Passkey Registration - Start

**Endpoint:** `POST /api/auth/passkey/register/start`  
**Auth:** Protected (requires Bearer token)  
**Purpose:** Generate registration challenge for new passkey

### Request
```http
POST /api/auth/passkey/register/start
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJjbGllbnQiLCJ0d29GYWN0b3JBdXRoZW50aWNhdGVkIjp0cnVlLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA0ODAwMH0.signature

{
  "deviceName": "iPhone 15 Pro"
}
```

### Success Response (200)
```json
{
  "options": {
    "challenge": "randomBase64URLString123456789abcdefghijklmnopqrstuvwxyz",
    "timeout": 60000,
    "rp": {
      "name": "SecurityWall",
      "id": "securitywall.co"
    },
    "user": {
      "id": "base64urlEncodedUserID123456789abcdefghijklmnopqrstuvwxyz",
      "name": "user@example.com",
      "displayName": "John Doe"
    },
    "pubKeyCredParams": [
      {
        "alg": -7,
        "type": "public-key"
      },
      {
        "alg": -257,
        "type": "public-key"
      }
    ],
    "authenticatorSelection": {
      "authenticatorAttachment": "platform",
      "userVerification": "preferred",
      "requireResidentKey": true
    },
    "attestation": "none",
    "excludeCredentials": []
  },
  "challengeKey": "reg:507f1f77bcf86cd799439011:xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx234"
}
```

### Error Responses

#### 401 - Unauthorized
```json
{
  "message": "No token, authorization denied"
}
```

#### 400 - Missing Device Name
```json
{
  "message": "Device name is required"
}
```

#### 400 - Invalid Device Name Length
```json
{
  "message": "Device name must be between 1 and 50 characters"
}
```

#### 400 - Invalid Device Name Characters
```json
{
  "message": "Device name can only contain letters, numbers, spaces, hyphens, underscores, periods, and parentheses"
}
```

#### 404 - User Not Found
```json
{
  "message": "User not found"
}
```

#### 500 - Server Error
```json
{
  "message": "Error starting passkey registration"
}
```

---

## 5. Passkey Registration - Complete

**Endpoint:** `POST /api/auth/passkey/register/complete`  
**Auth:** Protected (requires Bearer token)  
**Purpose:** Verify and store new passkey

### Request
```http
POST /api/auth/passkey/register/complete
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJjbGllbnQiLCJ0d29GYWN0b3JBdXRoZW50aWNhdGVkIjp0cnVlLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA0ODAwMH0.signature

{
  "challengeKey": "reg:507f1f77bcf86cd799439011:xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx234",
  "attestation": {
    "id": "base64urlEncodedCredentialID123456789abcdefghijklmnopqrstuvwxyz",
    "rawId": "base64urlEncodedCredentialID123456789abcdefghijklmnopqrstuvwxyz",
    "response": {
      "attestationObject": "base64urlEncodedAttestationObjectString123456789abcdefghijklmnopqrstuvwxyz",
      "clientDataJSON": "base64urlEncodedClientDataJSONString123456789abcdefghijklmnopqrstuvwxyz"
    },
    "type": "public-key"
  }
}
```

### Success Response (200)
```json
{
  "message": "Passkey registered successfully",
  "credentialID": "base64urlEncodedCredentialID123456789abcdefghijklmnopqrstuvwxyz"
}
```

### Error Responses

#### 401 - Unauthorized
```json
{
  "message": "No token, authorization denied"
}
```

#### 400 - Missing Required Fields
```json
{
  "message": "Challenge key and attestation are required"
}
```

#### 400 - Invalid or Expired Challenge
```json
{
  "message": "Invalid or expired challenge"
}
```

#### 403 - Challenge Mismatch
```json
{
  "message": "Challenge does not match user"
}
```

#### 400 - Duplicate Passkey
```json
{
  "message": "This passkey is already registered"
}
```

#### 400 - Passkey Verification Failed
```json
{
  "message": "Passkey verification failed: Invalid attestation"
}
```

#### 500 - Server Error
```json
{
  "message": "Error completing passkey registration"
}
```

---

## 6. Get User's Passkeys

**Endpoint:** `GET /api/auth/passkeys`  
**Auth:** Protected (requires Bearer token)  
**Purpose:** Retrieve all passkeys registered for the authenticated user

### Request
```http
GET /api/auth/passkeys
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJjbGllbnQiLCJ0d29GYWN0b3JBdXRoZW50aWNhdGVkIjp0cnVlLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA0ODAwMH0.signature
```

### Success Response (200) - With Passkeys
```json
{
  "passkeys": [
    {
      "credentialID": "base64urlEncodedCredentialID123456789abcdefghijklmnopqrstuvwxyz",
      "deviceName": "iPhone 15 Pro",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "lastUsedAt": "2024-01-20T14:22:00.000Z"
    },
    {
      "credentialID": "anotherBase64urlEncodedCredentialID987654321zyxwvutsrqponmlkjihgfedcba",
      "deviceName": "MacBook Pro",
      "createdAt": "2024-01-16T09:15:00.000Z",
      "lastUsedAt": "2024-01-19T16:45:00.000Z"
    },
    {
      "credentialID": "thirdBase64urlEncodedCredentialID456789abcdefghijklmnopqrstuvwxyz123",
      "deviceName": "Windows PC",
      "createdAt": "2024-01-18T11:20:00.000Z",
      "lastUsedAt": null
    }
  ]
}
```

### Success Response (200) - No Passkeys
```json
{
  "passkeys": []
}
```

### Error Responses

#### 401 - Unauthorized
```json
{
  "message": "No token, authorization denied"
}
```

#### 404 - User Not Found
```json
{
  "message": "User not found"
}
```

#### 500 - Server Error
```json
{
  "message": "Error fetching passkeys"
}
```

---

## 7. Delete Passkey

**Endpoint:** `DELETE /api/auth/passkeys/:credentialId`  
**Auth:** Protected (requires Bearer token)  
**Purpose:** Remove a registered passkey

### Request
```http
DELETE /api/auth/passkeys/base64urlEncodedCredentialID123456789abcdefghijklmnopqrstuvwxyz
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJjbGllbnQiLCJ0d29GYWN0b3JBdXRoZW50aWNhdGVkIjp0cnVlLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA0ODAwMH0.signature
```

### Success Response (200)
```json
{
  "message": "Passkey deleted successfully"
}
```

### Error Responses

#### 401 - Unauthorized
```json
{
  "message": "No token, authorization denied"
}
```

#### 400 - Missing Credential ID
```json
{
  "message": "Credential ID is required"
}
```

#### 400 - Invalid Credential ID
```json
{
  "message": "Invalid credential ID"
}
```

#### 404 - Passkey Not Found
```json
{
  "message": "Passkey not found"
}
```

#### 404 - User Not Found
```json
{
  "message": "User not found"
}
```

#### 500 - Server Error
```json
{
  "message": "Error deleting passkey"
}
```

---

## 8. Password Login (with hasPasskeys flag)

**Endpoint:** `POST /api/auth/login`  
**Auth:** Public (requires Turnstile)  
**Purpose:** Traditional password login (now includes hasPasskeys flag)

### Request
```http
POST /api/auth/login
Content-Type: application/json
cf-turnstile-response: 0.abcdefghijklmnopqrstuvwxyz123456789

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Success Response (200) - 2FA Enabled
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJjbGllbnQiLCJ0d29GYWN0b3JSZXF1aXJlZCI6dHJ1ZSwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwNDgwMDB9.signature",
  "role": "client",
  "is2faEnabled": true,
  "hasPasskeys": true,
  "message": "2FA required"
}
```

### Success Response (200) - No 2FA
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJjbGllbnQiLCJ0d29GYWN0b3JBdXRoZW50aWNhdGVkIjp0cnVlLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA0ODAwMH0.signature",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMTcyODAwfQ.signature",
  "role": "client",
  "is2faEnabled": false,
  "hasPasskeys": false,
  "message": "Login successful"
}
```

### Success Response (403) - 2FA Setup Required
```json
{
  "message": "2FA setup required",
  "setup2FA": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInNldHVwMkZBIjp0cnVlLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMH0.signature"
}
```

### Error Responses

#### 400 - Invalid Credentials
```json
{
  "message": "Invalid credentials"
}
```

#### 403 - Account Deactivated
```json
{
  "message": "Your account has been deactivated"
}
```

#### 400 - Invalid Turnstile Token
```json
{
  "message": "Invalid Turnstile token"
}
```

#### 500 - Server Error
```json
{
  "message": "Server error"
}
```

---

## Notes

### Authentication Tokens
- **Access Token:** Valid for 12 hours
- **Refresh Token:** Valid for 2 days
- **Temp Token (2FA setup):** Valid until 2FA is configured

### Challenge Expiration
- All challenges expire after **5 minutes**
- Challenges are stored in-memory and automatically cleaned up

### Turnstile Protection
- Public endpoints require `cf-turnstile-response` header
- Get Turnstile token from Cloudflare Turnstile widget on frontend

### WebAuthn Assertion/Attestation Format
The `assertion` and `attestation` objects follow the WebAuthn standard:
- `id`: Base64URL encoded credential ID
- `rawId`: Same as `id` (ArrayBuffer converted to base64url)
- `response`: Contains authenticator data, client data, and signature
- `type`: Always `"public-key"`

### Error Handling Best Practices
1. Always check response status codes
2. Handle 401 errors by redirecting to login
3. Handle 400 errors by showing user-friendly messages
4. Log 500 errors for debugging
5. Implement retry logic for network errors

### Security Considerations
- Never expose credential IDs or public keys in error messages
- Always validate input on both client and server
- Use HTTPS in production
- Implement rate limiting on frontend
- Store tokens securely (httpOnly cookies preferred)

---

## Example Frontend Flow

### Complete Passkey Login Flow
```javascript
// 1. Check login methods
const checkResponse = await fetch('/api/auth/check-login-methods', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'cf-turnstile-response': turnstileToken
  },
  body: JSON.stringify({ email: 'user@example.com' })
});
const { hasPasskeys } = await checkResponse.json();

if (hasPasskeys) {
  // 2. Start passkey login
  const startResponse = await fetch('/api/auth/passkey/login/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'cf-turnstile-response': turnstileToken
    },
    body: JSON.stringify({ email: 'user@example.com' })
  });
  const { options, challengeKey } = await startResponse.json();

  // 3. Browser prompts user
  const assertion = await navigator.credentials.get({
    publicKey: options
  });

  // 4. Complete login
  const completeResponse = await fetch('/api/auth/passkey/login/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      challengeKey,
      assertion
    })
  });
  const { token, refreshToken, role } = await completeResponse.json();
  
  // Store tokens and redirect
}
```

### Complete Passkey Registration Flow
```javascript
// 1. Start registration
const startResponse = await fetch('/api/auth/passkey/register/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({ deviceName: 'iPhone 15 Pro' })
});
const { options, challengeKey } = await startResponse.json();

// 2. Browser creates passkey
const attestation = await navigator.credentials.create({
  publicKey: options
});

// 3. Complete registration
const completeResponse = await fetch('/api/auth/passkey/register/complete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    challengeKey,
    attestation
  })
});
const { message, credentialID } = await completeResponse.json();
```

---

## Testing

### Using cURL

#### Check Login Methods
```bash
curl -X POST http://localhost:3000/api/auth/check-login-methods \
  -H "Content-Type: application/json" \
  -H "cf-turnstile-response: YOUR_TURNSTILE_TOKEN" \
  -d '{"email":"user@example.com"}'
```

#### Get Passkeys (requires auth)
```bash
curl -X GET http://localhost:3000/api/auth/passkeys \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Delete Passkey (requires auth)
```bash
curl -X DELETE http://localhost:3000/api/auth/passkeys/CREDENTIAL_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Support

For issues or questions, refer to:
- `/LOGIN_FLOW_DIAGRAM.md` - Visual flow diagrams
- `/PASSKEY_FLOW_EXPLANATION.md` - Detailed flow explanations

