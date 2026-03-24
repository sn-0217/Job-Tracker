export interface NetworkingContact {
  id: string;
  name: string;
  company?: string;
  email?: string;
  /** Short description: "Reached out about SWE role", etc. */
  context?: string;
  /** Paste the Gmail / email URL here */
  emailLink?: string;
  dateSent: string;       // ISO date
  followUpDate?: string;  // ISO date
  done: boolean;
  createdAt: string;      // ISO
}
