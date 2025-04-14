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
  signUpCode: string;
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
  pentests: {
    _id: string;
    name: string;
  }[];
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
    vulnerabilitiesCount: number;
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
  clients: {
    _id: string;
    name: string;
    logoUrl: string;
  }[];
  pentesters: Pentester[];
  vulnerabilitiesCount: number;
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