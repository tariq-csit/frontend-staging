export const apiRoutes = {
  login : 'http://172.86.114.162:4000/api/auth/login',
  twoFa : 'http://172.86.114.162:4000/api/auth/setup-2fa',
  setup2FaVerify: 'http://172.86.114.162:4000/api/auth/setup-2fa-verify',
  verify2Fa : 'http://172.86.114.162:4000/api/auth/verify-2fa',
  refreshToken: 'http://172.86.114.162:4000/api/auth/refresh',
  dashboard : '/admin/dashboard',
  recentActivities: '/admin/latest-activities'
}