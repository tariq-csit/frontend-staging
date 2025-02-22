export interface User {
  _id: string
  role: string
  name: string
  profilePicture?: string
}

interface Attachment {
  _id: string
  url: string
  name: string
  key: string
  contentType: string
}

interface Comment {
  _id: string
  user: User
  comment: string
  internal: boolean
}

export interface Vulnerability {
  _id: string
  title: string
  description: string
  severity: string
  status: string
  pentest: string
  reporter: User
  attachments: Attachment[]
  cvss: number
  cvssVector: string
  affected_host: string
  likelihood: string
  recommended_solution: string
  steps_to_reproduce: string
  impact: string
  comments: Comment[]
  createdAt: string
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


export interface Pentest {
  _id: string
  name: string
  type: string
  startDate: string
  endDate: string
  attachments: Attachment[]
  service: string
  assets: string[]
  testingCredentials: string
  status: string
  decision: string
  clients: string[]
  vulnerabilities: Vulnerability[]
  dateAdded: string
  pentesters: User[]
  integrations: any[],
}

