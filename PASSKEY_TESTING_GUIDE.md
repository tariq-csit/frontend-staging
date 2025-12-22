# Passkey Authentication Testing Guide

## Prerequisites

### 1. Browser Requirements
- **Modern browser with WebAuthn support:**
  - Chrome/Edge (recommended) - Full support
  - Safari 14+ (macOS/iOS) - Full support
  - Firefox 60+ - Full support
- **HTTPS required** (WebAuthn requires secure context)
  - `localhost` works for development
  - For testing on network, use HTTPS or configure your dev server

### 2. Device Setup
- **Desktop**: Requires hardware security key OR platform authenticator (Windows Hello, Touch ID, etc.)
- **Mobile**: Uses built-in biometrics (Face ID, Touch ID, fingerprint)

### 3. Backend Requirements
- Backend API should be running and accessible
- All passkey endpoints should be implemented
- Database should be set up for storing passkeys

## Testing Scenarios

### Scenario 1: User WITHOUT Passkeys (New User or First Time)

#### Step 1: Initial Login
1. Navigate to `/login`
2. Enter an email address for a user that **doesn't have passkeys** registered
3. Wait for the login method check (you should see "Checking login methods...")
4. **Expected**: Password field should appear (not passkey button)

#### Step 2: Password Login
1. Enter password
2. Complete Turnstile verification
3. Click "Sign in"
4. **Expected**: 
   - If 2FA enabled → OTP screen
   - If 2FA disabled → Direct login to dashboard

#### Step 3: Passkey Setup Prompt
1. After successful login, wait ~1 second
2. **Expected**: Passkey setup prompt modal should appear
3. Click "Maybe Later" → Prompt should dismiss for 7 days
4. OR Click "Set up Passkey" → Registration dialog should open

#### Step 4: Register Passkey (First Time)
1. If you clicked "Set up Passkey":
   - Enter device name (e.g., "MacBook Pro", "iPhone 15")
   - Click "Register Passkey"
   - **Expected**: Browser biometric prompt appears (Touch ID, Face ID, etc.)
   - Authenticate with biometrics
   - **Expected**: Success message, prompt closes

### Scenario 2: User WITH Passkeys

#### Step 1: Login with Passkey
1. Navigate to `/login`
2. Enter an email address for a user that **has passkeys** registered
3. Wait for the login method check
4. **Expected**: "Login with Passkey" button should appear (password field hidden)

#### Step 2: Authenticate with Passkey
1. Click "Login with Passkey"
2. **Expected**: Browser biometric prompt appears
3. Authenticate (Touch ID, Face ID, fingerprint, etc.)
4. **Expected**: 
   - Direct login to dashboard (no password, no OTP needed)
   - Success toast: "Successfully logged in with passkey!"

#### Step 3: Fallback to Password
1. If you see passkey button, click "Use password instead"
2. **Expected**: Password field appears, passkey button hidden
3. Enter password and login normally

### Scenario 3: Passkey Management (Settings Page)

#### Step 1: View Passkeys
1. Log in to your account
2. Navigate to `/settings` (or your settings route)
3. Scroll to "Passkey Management" section
4. **Expected**: 
   - List of all registered passkeys with:
     - Device name
     - Created date
     - Last used date (if available)

#### Step 2: Add New Passkey
1. Click "Add Passkey" button
2. Enter device name
3. Click "Register Passkey"
4. Authenticate with biometrics
5. **Expected**: New passkey appears in list

#### Step 3: Delete Passkey
1. Click trash icon next to a passkey
2. **Expected**: Confirmation dialog appears
3. Click "Delete" in confirmation
4. **Expected**: 
   - Passkey removed from list
   - Success toast: "Passkey Deleted"
   - Can still login with other passkeys

### Scenario 4: Error Handling

#### Test 1: Passkey Cancellation
1. Start passkey login
2. Cancel the biometric prompt (don't authenticate)
3. **Expected**: 
   - Error toast: "Authentication Cancelled"
   - Password field appears as fallback

#### Test 2: Invalid Email
1. Enter invalid email format
2. **Expected**: Email validation error appears

#### Test 3: Browser Not Supported
1. Use an old browser (or disable WebAuthn)
2. **Expected**: Appropriate fallback message

#### Test 4: Network Error
1. Disconnect internet
2. Try passkey login
3. **Expected**: Error message, can retry or use password

## Testing Checklist

### Login Flow
- [ ] Email input validates correctly
- [ ] Login method check works (shows passkey button or password field)
- [ ] Passkey button appears for users with passkeys
- [ ] Password field appears for users without passkeys
- [ ] Toggle between passkey and password works
- [ ] Turnstile verification required before login
- [ ] Passkey login bypasses 2FA
- [ ] Password login still requires 2FA (if enabled)
- [ ] Error messages are user-friendly
- [ ] Loading states show during async operations

### Registration Flow
- [ ] Setup prompt appears after login (if no passkeys)
- [ ] Setup prompt respects dismissal (7-day expiry)
- [ ] Device name validation works
- [ ] Registration dialog opens correctly
- [ ] WebAuthn prompt appears
- [ ] Success message shows after registration
- [ ] Passkey list updates after registration

### Settings/Management
- [ ] Passkeys list loads correctly
- [ ] Empty state shows when no passkeys
- [ ] Add passkey works from settings
- [ ] Delete confirmation dialog works
- [ ] Passkey deletion works
- [ ] List refreshes after add/delete
- [ ] Dates format correctly

### Browser Compatibility
- [ ] Works in Chrome/Edge
- [ ] Works in Safari (if on macOS/iOS)
- [ ] Works in Firefox
- [ ] Shows appropriate message for unsupported browsers

## Common Issues & Troubleshooting

### Issue: "Passkeys are not supported in your browser"
**Solution**: 
- Use a modern browser (Chrome, Firefox, Safari 14+, Edge)
- Ensure you're on HTTPS or localhost
- Check browser console for specific errors

### Issue: Biometric prompt doesn't appear
**Possible causes**:
- Browser doesn't support WebAuthn
- Not on HTTPS/localhost
- Device doesn't have biometric authentication set up
- Backend isn't returning correct options format

**Solution**:
- Check browser console for errors
- Verify backend API response structure
- Ensure device has biometric authentication enabled

### Issue: "Checking login methods..." never finishes
**Possible causes**:
- Backend endpoint not responding
- Network error
- CORS issues

**Solution**:
- Check browser Network tab for API calls
- Verify backend is running
- Check console for errors

### Issue: Passkey login succeeds but redirect fails
**Solution**:
- Check that tokens are stored in localStorage
- Verify redirect logic in `useAuthRedirect` hook
- Check browser console for errors

### Issue: Setup prompt doesn't appear after login
**Possible causes**:
- User already has passkeys
- Prompt was dismissed in this session
- Session storage already set

**Solution**:
- Clear sessionStorage: `sessionStorage.clear()`
- Check if user has passkeys in settings
- Verify Layout component logic

## Debugging Tips

### 1. Check Browser Console
Open DevTools (F12) and check:
- Network tab for API calls
- Console tab for errors
- Application tab > Local Storage to see stored tokens

### 2. Check API Responses
Verify these endpoints return expected data:
- `POST /api/auth/check-login-methods` → `{ hasPasskeys: boolean }`
- `POST /api/auth/passkey/login/start` → `{ options, challengeKey }`
- `GET /api/auth/passkeys` → Array of passkeys

### 3. Test with Different Users
- Create a test user with passkeys
- Create a test user without passkeys
- Test with different roles (admin, client, pentester)

### 4. Test on Different Devices
- Desktop with Windows Hello / Touch ID
- Mobile device with Face ID / fingerprint
- Different browsers

## Quick Test Commands

```javascript
// In browser console - Check WebAuthn support
console.log('WebAuthn supported:', typeof PublicKeyCredential !== 'undefined');

// Check stored tokens
console.log('Token:', localStorage.getItem('token'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));

// Clear session storage (to retest setup prompt)
sessionStorage.clear();

// Clear all auth data
localStorage.clear();
sessionStorage.clear();
```

## Expected API Endpoints

Make sure your backend implements these endpoints:

**Public (with Turnstile):**
- `POST /api/auth/check-login-methods`
- `POST /api/auth/passkey/login/start`
- `POST /api/auth/passkey/login/complete`

**Protected (with Auth token):**
- `GET /api/auth/passkeys`
- `POST /api/auth/passkey/register/start`
- `POST /api/auth/passkey/register/complete`
- `DELETE /api/auth/passkeys/:credentialId`

## Next Steps After Testing

1. **If everything works**: You're good to go! 🎉
2. **If issues found**: 
   - Check browser console for errors
   - Verify backend API responses match expected format
   - Test with different browsers/devices
   - Review the implementation files for any issues

Good luck with testing! 🚀

