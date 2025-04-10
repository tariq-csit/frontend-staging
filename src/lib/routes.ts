export const apiRoutes = {
  // Authentication Routes
  login : `/auth/login`,
  logout: `/auth/logout`,
  signup: `/auth/signup`,
  refreshToken: `/auth/refresh`,
  twoFa : `/auth/setup-2fa`,
  setup2FaVerify: `/auth/setup-2fa-verify`,
  verify2Fa : `/auth/verify-2fa`,
  user: `/auth/me`,

  // Admin Dashboard Routes
  dashboard : `/admin/dashboard`,
  recentActivities: `/admin/latest-activities`,

  // Pentest Routes
  pentests: {
    all: `/admin/pentests/all`,
    create: `/admin/pentests`,
    details: (pentestId: string) => `/admin/pentests/${pentestId}`,
    vulnerabilities: {
      all: (pentestId: string) => `/admin/pentests/${pentestId}/vulnerabilities`,
      details: (pentestId: string, vulnerabilityId: string) => `/admin/pentests/${pentestId}/vulnerabilities/${vulnerabilityId}`,
      createReport: (pentestId: string) => `/admin/pentests/${pentestId}/vulnerability`,
      status: (pentestId: string, vulnerabilityId: string) => `/admin/pentests/${pentestId}/vulnerability/${vulnerabilityId}/status/`,
    },
  },

  clients: {
    all: `/admin/clients`,
    sendSignupCode: `/admin/signup-code`,
    onboardUser: `/admin/users/onboard-client`,
    detail: (id: string) => `/admin/clients/${id}`,
  },

  pentesters: {
    all: `/admin/users/pentester`,
    onboardUser: `/admin/users/onboard-pentester`,
    pentester: (id: string) => `/admin/users/pentester/${id}`,
    reset2FA: (id: string) => `/admin/users/pentester/${id}/reset-2fa`,
  }, 
  // Upload Routes
  uploadLogo: `/upload/company-logo`,
  uploadVulnerabilityAttachment: "/upload/attachment",

  changePassword: `/auth/password`,
}
