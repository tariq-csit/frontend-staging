export interface User {
  _id: string
  role: string
  name: string
  profilePicture?: string
}

export interface Vulnerability {
  _id: string
  title: string
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
