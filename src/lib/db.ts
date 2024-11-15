import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface User {
  id: string;
  username: string;
  profilePic?: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    lastUpdated: number;
  };
  settings: {
    visibility: 'public' | 'private';
    notifications: boolean;
    locationSharing: boolean;
  };
  lastActive: number;
  createdAt: number;
  updatedAt: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

interface LocalDateDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: {
      'by-username': string;
      'by-location': [number, number];
    };
  };
  messages: {
    key: string;
    value: Message;
    indexes: {
      'by-sender': string;
      'by-receiver': string;
      'by-timestamp': number;
    };
  };
  auth: {
    key: string;
    value: {
      token: string;
      userId: string;
      expiresAt: number;
    };
  };
}

let db: IDBPDatabase<LocalDateDB>;

export async function initDB() {
  db = await openDB<LocalDateDB>('localdate', 1, {
    upgrade(db) {
      // Users store
      const userStore = db.createObjectStore('users', { keyPath: 'id' });
      userStore.createIndex('by-username', 'username', { unique: true });
      userStore.createIndex('by-location', ['location.latitude', 'location.longitude'], { unique: false });

      // Messages store
      const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
      messageStore.createIndex('by-sender', 'senderId', { unique: false });
      messageStore.createIndex('by-receiver', 'receiverId', { unique: false });
      messageStore.createIndex('by-timestamp', 'timestamp', { unique: false });

      // Auth store
      db.createObjectStore('auth', { keyPath: 'token' });
    },
  });
  return db;
}

// User operations
export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const newUser = {
    ...user,
    id: crypto.randomUUID(),
    lastActive: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.put('users', newUser);
  return newUser;
}

export async function getUser(id: string): Promise<User | undefined> {
  return await db.get('users', id);
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  return await db.getFromIndex('users', 'by-username', username);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const user = await getUser(id);
  if (!user) throw new Error('User not found');
  
  const updatedUser = {
    ...user,
    ...updates,
    lastActive: Date.now(),
    updatedAt: Date.now(),
  };
  await db.put('users', updatedUser);
  return updatedUser;
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete('users', id);
}

// Message operations
export async function sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<Message> {
  const newMessage = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    read: false,
  };
  await db.put('messages', newMessage);
  return newMessage;
}

export async function getMessages(userId: string): Promise<Message[]> {
  const tx = db.transaction('messages', 'readonly');
  const sentMessages = await tx.store.index('by-sender').getAll(userId);
  const receivedMessages = await tx.store.index('by-receiver').getAll(userId);
  return [...sentMessages, ...receivedMessages].sort((a, b) => b.timestamp - a.timestamp);
}

// Auth operations
export async function setAuthToken(token: string, userId: string, expiresIn: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  await db.put('auth', {
    token,
    userId,
    expiresAt: Date.now() + expiresIn,
  });
}

export async function getAuthToken(): Promise<{ token: string; userId: string } | null> {
  const tx = db.transaction('auth', 'readonly');
  const store = tx.objectStore('auth');
  const allAuth = await store.getAll();
  
  if (allAuth.length === 0) return null;
  
  const auth = allAuth[0];
  if (auth.expiresAt < Date.now()) {
    await db.clear('auth');
    return null;
  }
  
  return { token: auth.token, userId: auth.userId };
}

// Nearby users
export async function getNearbyUsers(latitude: number, longitude: number, radiusKm: number = 10): Promise<User[]> {
  const users = await db.getAll('users');
  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;

  return users.filter(user => {
    // Filter out users without location or with stale location data
    if (!user.location || !user.location.lastUpdated || (now - user.location.lastUpdated) > FIVE_MINUTES) {
      return false;
    }

    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      latitude,
      longitude,
      user.location.latitude,
      user.location.longitude
    );

    return distance <= radiusKm;
  });
}

// Haversine formula to calculate distance between two points on Earth
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
