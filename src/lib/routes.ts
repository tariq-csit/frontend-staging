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
    },
  },

  clients: {
    all: `/admin/clients`,
  },

  pentesters: `/admin/users/pentester`,

  // Upload Routes
  uploadLogo: `/upload/company-logo`,
  uploadVulnerabilityAttachment: "/upload/attachment"
}
