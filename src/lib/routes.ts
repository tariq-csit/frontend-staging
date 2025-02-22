export const apiRoutes = {
  login : `/auth/login`,
  twoFa : `/auth/setup-2fa`,
  setup2FaVerify: `/auth/setup-2fa-verify`,
  verify2Fa : `/auth/verify-2fa`,
  refreshToken: `/auth/refresh`,
  dashboard : `/admin/dashboard`,
  recentActivities: `/admin/latest-activities`,
  user: `/auth/me`,
  logout: `/auth/logout`,
  allVulnerabilities: (pentestId: string) => `/admin/pentests/${pentestId}/vulnerabilities`,
  vulnerabilityDetails: (pentestId: string, vulnerabilityId: string) => `/admin/pentests/${pentestId}/vulnerabilities/${vulnerabilityId}`,
  allPentests: `/admin/pentests/all`,
  pentestDetails: (pentestId: string) => `/admin/pentests/${pentestId}`,
  uploadLogo: `/upload/company-logo`,
  signup: `/auth/signup`,
  createVulnerabilityReport: (pentestId: string) => `/admin/pentests/${pentestId}/vulnerability`,
  uploadVulnerabilityAttachment: "/upload/attachment"
}
