export interface Message {
  id: string;
  sender: 'me' | 'them';
  senderName?: string;
  senderEmail?: string;
  text: string;
  time: string;
  timestamp: number; // For chronological sorting
  status?: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  name: string;
  avatarColor: string;
  avatarLetter: string;
  isGroup: boolean;
  statusText: string;
  online: boolean;
  messages: Message[];
  unreadCount: number;
  inviteCode?: string;
  createdBy?: string;
  members?: string[];
  description?: string;
  createdAt?: string;
}

export interface UserSession {
  uid?: string;
  email: string;
  displayName?: string;
  initial: string;
  avatarColor: string;
}
