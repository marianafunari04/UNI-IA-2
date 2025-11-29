
export enum Screen {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  ONBOARDING = 'ONBOARDING',
  MAIN = 'MAIN',
  CURIOSITIES = 'CURIOSITIES',
}

export interface UserProfile {
  name: string;
  email: string;
  password?: string;
  gender?: string;
  photo?: string | null;
  isVisitor: boolean;
}
