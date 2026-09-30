import fs from 'fs';
import path from 'path';
import { HealthlinkID } from '../types/auth';

const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

export function initDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
  }
}

export function getUsers(): HealthlinkID[] {
  initDb();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB:', error);
    return [];
  }
}

export function saveUsers(users: HealthlinkID[]) {
  initDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

export function getUserByEmail(email: string): HealthlinkID | undefined {
  const users = getUsers();
  return users.find((u) => u.email === email);
}

export function getUserById(id: string): HealthlinkID | undefined {
  const users = getUsers();
  return users.find((u) => u.id === id);
}
