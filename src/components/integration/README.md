# Integration Page

This directory contains the integration page components for connecting external tools to the application.

## Components

### IntegrationsPage.tsx

The main integration page component that displays available integrations. Currently includes:

#### Jira Integration
- **Purpose**: Turn pentest vulnerabilities into Jira Stories, Epics, Tasks, or Bugs automatically
- **UI**: Card-based layout with Jira branding
- **Access**: Only available to client users
- **Features**: 
  - Fully customizable integration
  - OAuth flow initiation
  - Connection status indicator
  - Connect/Disconnect functionality
  - Dark mode support
  - Automatic status refresh

#### Jira Integration States
- **Not Connected**: Shows "Connect to Jira Now" button
- **Connected**: Shows green status indicator and "Disconnect Jira" button
- **Loading**: Handles async operations with proper error handling

### JiraCallback.tsx

OAuth callback handler component that processes the Jira authorization response.

#### Features
- **Parameter Extraction**: Extracts `code` and `state` from URL query parameters
- **Error Handling**: Handles OAuth errors and missing parameters
- **Token Exchange**: Makes callback request to backend for token exchange (only once!)
- **UI States**: Loading, success, and error states with appropriate visuals
- **Logging**: Comprehensive console logging for debugging
- **Navigation**: Automatic redirect to Jira setup page after success
- **Duplicate Prevention**: Uses React ref to prevent duplicate API calls
- **Cache Invalidation**: Invalidates query cache to refresh organization data
- **State Passing**: Passes navigation state to setup page to handle timing issues

### JiraSetup.tsx

Jira configuration page that allows users to configure their integration after successful connection.

#### Features
- **Connection Verification**: Verifies Jira is connected before showing configuration
- **State Handling**: Handles navigation state from callback to prevent timing issues
- **Loading States**: Shows appropriate loading while organization data refreshes
- **Project Selection**: Fetches and displays available Jira projects
- **Visual Project Grid**: Interactive project selection with hover states
- **Configuration Summary**: Shows selected settings before saving
- **Auto-send Settings**: Configures automatic vulnerability sending
- **Skip Option**: Allows users to skip configuration and return later
- **Fallback Logic**: Proceeds with setup even if integration status hasn't updated yet

#### OAuth Flow
1. **User Clicks Connect**: `IntegrationsPage` initiates OAuth
2. **Backend Response**: Returns Jira OAuth URL with modified `redirect_uri`
3. **Frontend URL Modification**: Frontend modifies the `redirect_uri` to `http://localhost:5173/clients/integrations/jira/callback`
4. **Jira Authorization**: User is redirected to Jira for authorization
5. **Callback**: Jira redirects back to callback component with `code` and `state`
6. **Token Exchange**: Callback component sends code to backend (only once using React ref)
7. **Cache Invalidation**: Query cache is invalidated to refresh organization data
8. **Setup Navigation**: User is redirected to `/integrations/jira/setup` with state
9. **State Handling**: Setup page handles navigation state to prevent timing issues
10. **Configuration**: User selects Jira project and saves configuration
11. **Completion**: Returns to main integrations page with updated status

## API Integration

### OAuth Endpoints
- `POST /clients/{clientId}/integrations/jira` - Initiate OAuth flow
  - **Response**: `{ "url": "https://auth.atlassian.com/authorize?..." }`
  - **Note**: Backend should set `redirect_uri` to callback URL
- `GET /clients/integrations/jira/callback` - OAuth callback (token exchange)
  - **Parameters**: `code`, `state` (from Jira OAuth response)
  - **Response**: `{ "message": "Jira integration successful" }`

### Management Endpoints
- `GET /clients/{clientId}/integrations/jira/projects` - Fetch available projects
- `DELETE /clients/{clientId}/integrations/jira` - Disconnect integration

## Access Control

The integration pages are protected by the `ClientProtectedRoute` component and are only accessible to users with the "client" role. This is configured in:

- **Route Protection**: `src/App.tsx` - `/integration` route wrapped with `ClientProtectedRoute`
- **Setup Route**: `src/App.tsx` - `/integrations/jira/setup` wrapped with `ClientProtectedRoute`
- **Callback Route**: `src/App.tsx` - `/clients/integrations/jira/callback` (public for OAuth)
- **Sidebar Navigation**: `src/components/sidebar/Sidebar.tsx` - Integration link only shown to client users

## API Routes Structure

The integration routes are organized under the client section in `src/lib/routes.ts`:

```typescript
client: {
  integrations: {
    jira: {
      initiate: (clientId: string) => `/clients/${clientId}/integrations/jira`,
      callback: `/clients/integrations/jira/callback`,
      projects: (clientId: string) => `/clients/${clientId}/integrations/jira/projects`,
      status: (clientId: string) => `/clients/${clientId}/integrations/jira/status`,
      disconnect: (clientId: string) => `/clients/${clientId}/integrations/jira`,
    },
  },
}
```

## Development Notes

### OAuth Flow Testing
When testing the OAuth flow in development:
1. Ensure the backend is configured with the correct callback URL: `http://localhost:5173/clients/integrations/jira/callback`
2. Check browser console for detailed logging during the OAuth process
3. Monitor network requests to verify proper API calls

### State Management Issues
The fix for the "Jira not connected" issue after successful callback includes:
- **Query Cache Invalidation**: Immediately invalidates organization data cache
- **Navigation State**: Passes state to indicate successful connection
- **Fallback Logic**: Setup page proceeds even if integration status hasn't updated
- **Loading States**: Shows appropriate loading while data refreshes

### Debugging
- All OAuth steps are logged to browser console
- Error responses are displayed in the UI
- Toast notifications provide user feedback
- Connection results are logged and displayed for debugging

## Future Integrations

This page is designed to be extensible for additional integrations such as:
- Slack notifications
- Email integrations
- Other issue tracking systems (GitHub Issues, Azure DevOps, etc.)
- Security tools integration (SIEM, vulnerability scanners)

## Styling

The pages follow the application's design system with:
- Dark mode support using Tailwind's `dark:` prefix
- Consistent card styling with hover effects
- Responsive grid layout for multiple integrations
- Brand-consistent color schemes
- Status indicators with appropriate colors (green for connected, red for disconnect actions)
- Loading states with spinners and skeleton components

## Error Handling

The components include comprehensive error handling for:
- Network failures
- Authentication errors
- Missing client information
- OAuth authorization denials
- Invalid callback parameters
- API response validation
- User feedback via toast notifications
- Timing issues between callback and setup page