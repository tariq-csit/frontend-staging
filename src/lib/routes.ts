const API_URL= process.env.API_URL
export const apiRoutes = {
  login : `${API_URL}/auth/login`,
  twoFa : `${API_URL}/auth/setup-2fa`,
  setup2FaVerify: `${API_URL}/auth/setup-2fa-verify`,
  verify2Fa : `${API_URL}/auth/verify-2fa`,
  refreshToken: `${API_URL}/auth/refresh`,
  dashboard : '/admin/dashboard',
  recentActivities: '/admin/latest-activities',
  user: '/auth/me',
  logout: '/auth/logout'
}