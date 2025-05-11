export interface User {
  _id: string
  role: string
  name: string
  profilePicture?: string
}

export interface Attachment {
  id: string;
  url: string;
  name: string;
  key: string;
  contentType: string;
  size?: number;
}

interface Comment {
  _id: string
  user: User
  comment: string
  internal: boolean
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface Vulnerability {
  _id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  pentest: string;
  reporter: User;
  attachments: Attachment[];
  cvss: number;
  cvssVector: string;
  affected_host: string;
  likelihood: string;
  recommended_solution: string;
  steps_to_reproduce: string;
  impact: string;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  code: string;
  companyName: string;
  poc_email: string;
  logoUrl: string;
}

export interface Client {
  _id: string;
  name: string;
  poc_email: string;
  logoUrl: string;
  integrations: {
    jira: {
      isIntegrated: boolean;
      autoSendToJira: boolean;
    };
  };
  RequestedPentestsNo: number;
  pentests: Pentest[];
  users: {
    _id: string;
    email: string;
    name: string;
    role: string;
  }[];
}

export interface Pentester {
  _id: string;
  email: string;
  name: string;
  role: string;
  profilePicture: string;
  twoFactorEnabled: boolean;
  isActive: boolean;
  vulnerabilityCount: number;
  clients: {
    _id: string;
    name: string;
  }[];
  pentests: {
    _id: string;
    name: string;
    type: string;
    startDate: string;
    endDate: string;
    vulnerabilityCount: number;
  }[];
}

interface Report {
  isUploaded: boolean;
  isPublished: boolean;
}

export interface Pentest {
  _id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  service: string;
  assets: string[];
  testingCredentials: string;
  additionalNotes?: string;
  requestedBy?: string;
  requestedOn?: string;
  clients: {
    _id: string;
    name: string;
    logoUrl: string;
  }[];
  pentesters: Pentester[];
  vulnerabilityCount: number;
  report: Report;
  retestReport: Report;
  attachments: Attachment[];
}

// export interface Pentest {
//   _id: string;
//   name: string;
//   type: string;
//   status: string;
//   startDate: string;
//   endDate: string;
//   service: string;
//   decision: string;
//   clients: string[];
//   vulnerabilityCount: number;
//   hasReport: boolean;
//   hasRetestReport: boolean;
//   hasJiraIntegration: boolean;
// }


export interface ClientUser {
    _id: string;
    email: string;
    name: string;
    role: string;
    twoFactorEnabled: boolean;
    isActive: boolean;
    profilePicture?: string;
    clients: {
        _id: string;
        name: string;
        logoUrl?: string;
    }[];
    pentests: {
        _id: string;
        name: string;
        type: string;
        startDate: string;
        endDate: string;
    }[];
}

export interface SignupCode {
    _id: string;
    email: string;
    used: boolean;
    createdAt: string;
    expiresAt: string;
}

export interface PentestRequest {
  id: string;
  title: string;
  service: string;
  status: string;
  requestedBy: string;
  createdAt: string;
}

export interface RequestedPentest {
  id?: string;  // For list view
  _id?: string;  // For detail view
  title: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  service: string;
  assets?: string[];
  additionalNotes?: string;
  testingCredentials?: string;
  attachments?: {
    url: string;
    name: string;
    _id: string;
  }[];
  status?: string;
  createdAt: string;
  requestedBy: string | {
    name: string;
    email: string;
  };
  client: {
    id?: string;  // For list view
    _id?: string;  // For detail view
    name: string;
    logoUrl?: string;
  };
}