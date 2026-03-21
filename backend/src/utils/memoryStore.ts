import { v4 as uuidv4 } from 'uuid';

interface OtpEntry {
  bizId: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpEntry>();

// Memory store for fallback when Supabase is not available
const store = {
  users: new Map<string, any>(),
  dreams: new Map<string, any>(),
  profiles: new Map<string, any>(),
};

export const getMemoryStore = () => store;

export const generateId = () => uuidv4();

export const saveBizId = (phoneNumber: string, bizId: string, ttlSeconds: number = 300) => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  otpStore.set(phoneNumber, { bizId, expiresAt });
};

export const getBizId = (phoneNumber: string): string | null => {
  const entry = otpStore.get(phoneNumber);
  
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phoneNumber);
    return null;
  }

  return entry.bizId;
};
