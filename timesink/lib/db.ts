import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}

// Helper to check if database is connected
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// Helper to bucket IP addresses for privacy
export function bucketIpAddress(ip: string): string | null {
  try {
    // IPv4 - bucket to /24
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
      }
    }
    
    // IPv6 - bucket to /48
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 3) {
        return `${parts[0]}:${parts[1]}:${parts[2]}::/48`;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

// Helper to hash user agent strings
export function hashUserAgent(userAgent: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 16);
}

// Helper to create session with expiration
export async function createSession(mazeId: string, ip?: string, userAgent?: string, asn?: number) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  return await db.session.create({
    data: {
      mazeId,
      expiresAt,
      ipCidr24: ip ? bucketIpAddress(ip) : null,
      uaHash: userAgent ? hashUserAgent(userAgent) : null,
      asn: asn || null,
    },
  });
}

// Helper to cleanup expired data
export async function cleanupExpiredData(): Promise<{
  sessions: number;
  events: number;
  artifacts: number;
  flags: number;
}> {
  const now = new Date();
  
  // Delete in order due to foreign key constraints
  const flags = await db.flag.deleteMany({
    where: { expiresAt: { lt: now } }
  });
  
  const artifacts = await db.artifact.deleteMany({
    where: { expiresAt: { lt: now } }
  });
  
  const events = await db.event.deleteMany({
    where: { expiresAt: { lt: now } }
  });
  
  const sessions = await db.session.deleteMany({
    where: { expiresAt: { lt: now } }
  });
  
  return {
    sessions: sessions.count,
    events: events.count,
    artifacts: artifacts.count,
    flags: flags.count,
  };
}