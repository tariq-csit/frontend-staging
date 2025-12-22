# Login Flow - Step by Step

## Complete Login Flow with Endpoints

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN SCREEN (Frontend)                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ User enters EMAIL
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Check Login Methods                               │
│  POST /auth/check-login-methods                             │
│  Body: { email: "user@example.com" }                        │
│  Headers: { cf-turnstile-response: "..." }                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────┴───────┐
                    │               │
            hasPasskeys: true   hasPasskeys: false
                    │               │
                    ▼               ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│   PASSKEY FLOW            │  │   PASSWORD FLOW           │
│                           │  │                           │
│  STEP 2A: Start Passkey  │  │  STEP 2B: Password Login │
│  POST /auth/passkey/      │  │  POST /auth/login         │
│       login/start         │  │  Body: {                  │
│  Body: { email }          │  │    email: "...",           │
│  Headers: {               │  │    password: "..."        │
│    cf-turnstile-response  │  │  }                         │
│  }                         │  │  Headers: {               │
│                           │  │    cf-turnstile-response   │
│  Returns: {                │  │  }                         │
│    options: {...},         │  │                           │
│    challengeKey: "..."    │  │  Returns: {               │
│  }                         │  │    token: "...",          │
│                           │  │    is2faEnabled: true,     │
│                           │  │    message: "2FA required" │
│                           │  │  }                         │
└───────────────────────────┘  └───────────────────────────┘
            │                               │
            ▼                               ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│  STEP 3A: Browser Prompt  │  │  STEP 3B: Verify 2FA      │
│  Browser shows passkey    │  │  POST /auth/verify-2fa     │
│  prompt (Face ID, etc.)   │  │  Body: {                   │
│                           │  │    token: "...",           │
│  User authenticates       │  │    token: "123456"         │
│                           │  │  }                         │
└───────────────────────────┘  └───────────────────────────┘
            │                               │
            ▼                               ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│  STEP 4A: Complete Passkey│  │  STEP 4B: Get Tokens      │
│  POST /auth/passkey/      │  │  Returns: {                │
│       login/complete      │  │    token: "...",           │
│  Body: {                   │  │    refreshToken: "..."    │
│    email: "...",           │  │  }                         │
│    challengeKey: "...",    │  │                           │
│    assertion: {...}        │  │                           │
│  }                         │  │                           │
│                           │  │                           │
│  Returns: {                │  │                           │
│    token: "...",           │  │                           │
│    refreshToken: "...",    │  │                           │
│    role: "client"          │  │                           │
│  }                         │  │                           │
└───────────────────────────┘  └───────────────────────────┘
            │                               │
            └───────────┬───────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   USER LOGGED IN ✅   │
            └───────────────────────┘
```

## Frontend Implementation Example

```javascript
// Login Screen Component
class LoginScreen {
  async handleEmailEntered(email) {
    // STEP 1: Check what login methods are available
    const methodsResponse = await fetch('/api/auth/check-login-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-turnstile-response': await this.getTurnstileToken()
      },
      body: JSON.stringify({ email })
    });
    
    const { hasPasskeys } = await methodsResponse.json();
    
    if (hasPasskeys) {
      // STEP 2A: Start passkey flow
      await this.startPasskeyLogin(email);
    } else {
      // STEP 2B: Show password field
      this.showPasswordField();
    }
  }
  
  async startPasskeyLogin(email) {
    // STEP 2A: Get passkey challenge
    const startResponse = await fetch('/api/auth/passkey/login/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-turnstile-response': await this.getTurnstileToken()
      },
      body: JSON.stringify({ email })
    });
    
    const { options, challengeKey } = await startResponse.json();
    
    // STEP 3A: Browser prompts user for passkey
    try {
      const assertion = await navigator.credentials.get({
        publicKey: options
      });
      
      // STEP 4A: Complete passkey login
      const completeResponse = await fetch('/api/auth/passkey/login/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          challengeKey,
          assertion
        })
      });
      
      const { token, refreshToken, role } = await completeResponse.json();
      
      // User logged in!
      this.handleLoginSuccess(token, refreshToken, role);
      
    } catch (error) {
      // User cancelled or error occurred
      // Fallback to password login
      this.showPasswordField();
    }
  }
  
  async handlePasswordLogin(email, password) {
    // STEP 2B: Password login
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-turnstile-response': await this.getTurnstileToken()
      },
      body: JSON.stringify({ email, password })
    });
    
    const { token, is2faEnabled } = await loginResponse.json();
    
    if (is2faEnabled) {
      // STEP 3B: Verify 2FA
      const otp = await this.promptForOTP();
      
      const verifyResponse = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: otp })
      });
      
      const { token: finalToken, refreshToken, role } = await verifyResponse.json();
      this.handleLoginSuccess(finalToken, refreshToken, role);
    } else {
      // No 2FA needed
      this.handleLoginSuccess(token, null, role);
    }
  }
}
```

## Endpoint Summary

| Step | Endpoint | Purpose | Input | Output |
|------|----------|---------|-------|--------|
| **1** | `POST /auth/check-login-methods` | Check if email has passkeys | `{ email }` | `{ hasPasskeys: boolean }` |
| **2A** | `POST /auth/passkey/login/start` | Start passkey challenge | `{ email }` | `{ options, challengeKey }` |
| **3A** | Browser WebAuthn API | User authenticates | - | `assertion` object |
| **4A** | `POST /auth/passkey/login/complete` | Complete passkey login | `{ email, challengeKey, assertion }` | `{ token, refreshToken, role }` |
| **2B** | `POST /auth/login` | Password login | `{ email, password }` | `{ token, is2faEnabled, ... }` |
| **3B** | `POST /auth/verify-2fa` | Verify OTP | `{ token: otp }` | `{ token, refreshToken, role }` |

## Key Points

✅ **Step 1 is the decision point** - `/check-login-methods` determines which flow to use
✅ **Passkey flow** - No password, no OTP needed (passkey IS the 2FA)
✅ **Password flow** - Traditional email + password + OTP (if 2FA enabled)
✅ **Both flows** - Protected with Turnstile on public endpoints
✅ **Fallback** - If passkey fails, user can still use password

## User Experience

### User WITH Passkey:
1. Enters email → Sees "Login with Passkey" button
2. Clicks button → Face ID/Touch ID prompt appears
3. Authenticates → Logged in! (No password, no OTP)

### User WITHOUT Passkey:
1. Enters email → Sees password field
2. Enters password → Logged in (or OTP prompt if 2FA enabled)
3. Enters OTP → Logged in!

### User WITH Passkey but wants password:
1. Enters email → Sees "Login with Passkey" button
2. Clicks "Use password instead" → Password field appears
3. Enters password → Traditional flow continues

