import { checkCrisis } from '../safety/check';

export interface User {
  id: string;
  username: string;
  password?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'therapist';
  text: string;
  timestamp: string;
  isCrisis: boolean;
}

export interface SessionSummary {
  reflection: string;
  trajectory: string;
  copingSteps: string[];
  exercise: string;
}

export interface Session {
  id: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  mood: string | null;
  messages: ChatMessage[];
  summary: SessionSummary | null;
}

interface DatabaseSchema {
  users: Record<string, User>;
  sessions: Record<string, Session>;
}

// Client-side local storage helpers
function readDb(): DatabaseSchema {
  if (typeof window === 'undefined') {
    return { users: {}, sessions: {} };
  }
  try {
    const data = localStorage.getItem('aura_db');
    if (data) {
      return JSON.parse(data) as DatabaseSchema;
    }
  } catch (e) {
    console.error('Error reading localStorage DB:', e);
  }
  const initial: DatabaseSchema = { users: {}, sessions: {} };
  writeDb(initial);
  return initial;
}

function writeDb(data: DatabaseSchema): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('aura_db', JSON.stringify(data));
  } catch (e) {
    console.error('Error writing localStorage DB:', e);
  }
}

export async function createUser(username: string): Promise<User> {
  const db = readDb();
  
  // Check if user already exists
  const existing = Object.values(db.users).find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return existing;
  }

  const userId = 'u_' + Math.random().toString(36).substring(2, 11);
  const user: User = {
    id: userId,
    username,
    createdAt: new Date().toISOString(),
  };
  
  db.users[userId] = user;
  writeDb(db);
  return user;
}

export async function registerUser(username: string, password: string): Promise<User> {
  const db = readDb();
  
  // Check if user already exists
  const existing = Object.values(db.users).find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    throw new Error('Username already exists');
  }

  const userId = 'u_' + Math.random().toString(36).substring(2, 11);
  const user: User = {
    id: userId,
    username,
    password,
    createdAt: new Date().toISOString(),
  };
  
  db.users[userId] = user;
  writeDb(db);
  return user;
}

export async function verifyUser(username: string, password: string): Promise<User | null> {
  const db = readDb();
  const user = Object.values(db.users).find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  return user || null;
}

export async function getUser(userId: string): Promise<User | null> {
  const db = readDb();
  return db.users[userId] || null;
}

export async function createSession(userId: string): Promise<Session> {
  const db = readDb();
  
  const sessionId = 's_' + Math.random().toString(36).substring(2, 11);
  const session: Session = {
    id: sessionId,
    userId,
    startTime: new Date().toISOString(),
    endTime: null,
    mood: null,
    messages: [],
    summary: null,
  };
  
  db.sessions[sessionId] = session;
  writeDb(db);
  return session;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const db = readDb();
  return db.sessions[sessionId] || null;
}

export async function listSessions(userId: string): Promise<Session[]> {
  const db = readDb();
  return Object.values(db.sessions)
    .filter(s => s.userId === userId)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

export async function addMessage(
  sessionId: string, 
  sender: 'user' | 'therapist', 
  text: string
): Promise<ChatMessage> {
  const db = readDb();
  const session = db.sessions[sessionId];
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const isCrisis = sender === 'user' ? checkCrisis(text).isCrisis : false;

  const message: ChatMessage = {
    id: 'm_' + Math.random().toString(36).substring(2, 11),
    sender,
    text,
    timestamp: new Date().toISOString(),
    isCrisis,
  };

  session.messages.push(message);
  writeDb(db);
  return message;
}

export async function endSession(
  sessionId: string,
  summary: SessionSummary,
  mood: string
): Promise<Session> {
  const db = readDb();
  const session = db.sessions[sessionId];
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  session.endTime = new Date().toISOString();
  session.summary = summary;
  session.mood = mood;

  writeDb(db);
  return session;
}
