export interface User {
  id: string;
  username: string;
  description: string;
  profilePic: string | null;
  location: {
    latitude: number;
    longitude: number;
    lastUpdated: number;
  } | null;
  settings: {
    visibility: 'public' | 'private';
    notifications: boolean;
    locationSharing: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}
