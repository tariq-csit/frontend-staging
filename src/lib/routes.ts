export const apiRoutes = {
  // Authentication Routes
  login : `/auth/login`,
  logout: `/auth/logout`,
  signup: `/auth/signup`,
  refresh: `/auth/refresh`,
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
      edit: (pentestId: string, vulnerabilityId: string) => `/admin/pentests/${pentestId}/vulnerability/${vulnerabilityId}`,
      createReport: (pentestId: string) => `/admin/pentests/${pentestId}/vulnerability`,
      status: (pentestId: string, vulnerabilityId: string) => `/admin/pentests/${pentestId}/vulnerability/${vulnerabilityId}/status/`,
      comment: (pentestId: string, vulnerabilityId: string) => `/admin/pentests/${pentestId}/vulnerability/${vulnerabilityId}/comment`,
    },
    status: (pentestId: string) => `/admin/pentests/${pentestId}/status`,
    requests: `/admin/pentests/requests`,
    requestedPentest: (pentestId: string) => `/admin/pentests/requests/${pentestId}`,
    approveRequest: (requestId: string) => `/admin/pentests/requests/${requestId}/approve`,
    rejectRequest: (requestId: string) => `/admin/pentests/requests/${requestId}/reject`,
    reports: {
      // Pentest Report
      uploadPentestReport: (pentestId: string) => `/admin/pentests/${pentestId}/upload-pentest-report`,
      uploadRetestReport: (pentestId: string) => `/admin/pentests/${pentestId}/upload-retest-report`,
      publishPentestReport: (pentestId: string) => `/admin/pentests/${pentestId}/publish-pentest-report`,
      publishRetestReport: (pentestId: string) => `/admin/pentests/${pentestId}/publish-retest-report`,
      getPentestReport: (pentestId: string) => `/admin/pentests/${pentestId}/pentest-report`,
      getRetestReport: (pentestId: string) => `/admin/pentests/${pentestId}/retest-report`,
      deletePentestReport: (pentestId: string) => `/admin/pentests/${pentestId}/pentest-report`,
      deleteRetestReport: (pentestId: string) => `/admin/pentests/${pentestId}/retest-report`,
      requestReportPassword: (pentestId: string) => `/admin/pentests/${pentestId}/request-report-password`,
      requestRetestPassword: (pentestId: string) => `/admin/pentests/${pentestId}/request-retest-password`,
      // Report Comments
      addPentestReportComment: (pentestId: string) => `/admin/pentests/${pentestId}/pentest-report/comments`,
      getPentestReportComments: (pentestId: string) => `/admin/pentests/${pentestId}/pentest-report/comments`,
      addRetestReportComment: (pentestId: string) => `/admin/pentests/${pentestId}/retest-report/comments`,
      getRetestReportComments: (pentestId: string) => `/admin/pentests/${pentestId}/retest-report/comments`,
    },
  },

  clients: {
    all: `/admin/clients`,
    sendSignupCode: `/admin/signup-code`,
    onboardUser: `/admin/users/onboard-client`,
    detail: (id: string) => `/admin/clients/${id}`,
  },

  clientUsers: {
    all: "/admin/users/client",
    onboardUser: (clientId: string) => `/admin/client/${clientId}/users/onboard`,
    detail: (clientUserId: string) => `/admin/users/client/${clientUserId}`,
    deactivate: (clientUserId: string) => `/admin/users/client/${clientUserId}/deactivate`,
    reset2FA: (clientUserId: string) => `/admin/users/client/${clientUserId}/reset-2fa`,
  },

  pentesters: {
    all: `/admin/users/pentester`,
    onboardUser: `/admin/users/onboard-pentester`,
    pentester: (id: string) => `/admin/users/pentester/${id}`,
    reset2FA: (id: string) => `/admin/users/pentester/${id}/reset-2fa`,
    deactivate: (id: string) => `/admin/users/pentester/${id}/deactivate`,
  }, 

  signupCodes: `/admin/signup-codes`,

  // Pentester Dashboard Routes
  pentester: {
    // Dashboard
    dashboard: `/pentester/dashboard`,
    latestActivities: `/pentester/latest-activities`,
    statistics: `/pentester/statistics`,
    
    // Assigned Pentests
    assignedPentests: `/pentester/assigned-pentests`,
    pendingPentests: `/pentester/pending-pentests`,
    completedPentests: `/pentester/completed-pentests`,

    
    // Single Pentest Management
    pentestDetails: (pentestId: string) => `/pentester/assigned-pentests/${pentestId}`,
    updatePentestStatus: (pentestId: string) => `/pentester/pentests/${pentestId}/status`,
    
    // Vulnerabilities
    vulnerabilities: {
      create: (pentestId: string) => `/pentester/pentests/${pentestId}/vulnerability`,
      all: (pentestId: string) => `/pentester/pentests/${pentestId}/vulnerabilities`,
      details: (pentestId: string, vulnerabilityId: string) => `/pentester/pentests/${pentestId}/vulnerabilities/${vulnerabilityId}`,
      update: (pentestId: string, vulnerabilityId: string) => `/pentester/pentests/${pentestId}/vulnerability/${vulnerabilityId}`,
      delete: (pentestId: string, vulnerabilityId: string) => `/pentester/pentests/${pentestId}/vulnerability/${vulnerabilityId}`,
      updateStatus: (pentestId: string, vulnerabilityId: string) => `/pentester/pentests/${pentestId}/vulnerability/${vulnerabilityId}/status`,
      attachments: (pentestId: string, vulnerabilityId: string) => `/pentester/pentests/${pentestId}/vulnerability/${vulnerabilityId}/attachments`,
      comment: (pentestId: string, vulnerabilityId: string) => `/pentester/pentests/${pentestId}/vulnerability/${vulnerabilityId}/comment`,
    },
    
    // Clients 
    assignedClients: `/pentester/assigned-clients`,
    clientDetails: (clientId: string) => `/pentester/assigned-clients/${clientId}`,
    
  },

  // Client Dashboard Routes
  client: {
    // Dashboard
    dashboard: `/clients/dashboard`,
    latestActivities: `/clients/latest-activities`,
    
    // Organization/Client Info
    organization: `/clients/organization`,
    
    // Pentests
    pentests: {
      all: `/clients/pentests/all`,
      details: (pentestId: string) => `/clients/pentests/${pentestId}`,
      schedule: `/clients/pentests/schedule`,
      vulnerabilities: {
        all: (pentestId: string) => `/clients/pentests/${pentestId}/vulnerabilities`,
        details: (pentestId: string, vulnerabilityId: string) => `/clients/pentests/${pentestId}/vulnerabilities/${vulnerabilityId}`,
        status: (pentestId: string, vulnerabilityId: string) => `/clients/pentests/${pentestId}/vulnerability/${vulnerabilityId}/status`,
        comment: (pentestId: string, vulnerabilityId: string) => `/clients/pentests/${pentestId}/vulnerability/${vulnerabilityId}/comment`,
      },
      // Reports
      reports: {
        getPentestReport: (pentestId: string) => `/clients/pentests/${pentestId}/pentest-report`,
        getRetestReport: (pentestId: string) => `/clients/pentests/${pentestId}/retest-report`,
        requestReportPassword: (pentestId: string) => `/clients/pentests/${pentestId}/request-report-password`,
        requestRetestPassword: (pentestId: string) => `/clients/pentests/${pentestId}/request-retest-password`,
        // Report Comments
        addPentestReportComment: (pentestId: string) => `/clients/pentests/${pentestId}/pentest-report/comments`,
        getPentestReportComments: (pentestId: string) => `/clients/pentests/${pentestId}/pentest-report/comments`,
        addRetestReportComment: (pentestId: string) => `/clients/pentests/${pentestId}/retest-report/comments`,
        getRetestReportComments: (pentestId: string) => `/clients/pentests/${pentestId}/retest-report/comments`,
      },
    },
    
    // Pentest Requests
    pentestRequests: {
      all: `/clients/pentest-requests`,
      details: (requestId: string) => `/clients/pentest-requests/${requestId}`,
    },
    
    // Team Management
    team: {
      all: `/clients/users`,
      details: (userId: string) => `/clients/users/${userId}`,
      add: `/clients/users`,
      remove: (userId: string) => `/clients/users/${userId}`,
    },
  },

  // Upload Routes
  uploadLogo: `/upload/company-logo`,
  uploadProfilePicture: `/upload/profile-picture`,
  uploadVulnerabilityAttachment: "/upload/attachment",
  uploadPentestAttachment: "/upload/pentest-attachments",

  changePassword: `/auth/password`,
  forgotPassword: `/auth/request-reset`,
  resetPassword: `/auth/reset-password`,
}
