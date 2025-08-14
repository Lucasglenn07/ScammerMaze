import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

const secret = new TextEncoder().encode(
  process.env.MAZE_TOKEN_SECRET || 'fallback-secret-key'
);

export interface MazeToken {
  sessionId: string;
  trialId: string;
  step: number;
  seed: string;
  exp: number;
}

export async function signMazeToken(payload: Omit<MazeToken, 'exp'>): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + (15 * 60); // 15 minutes
  
  return await new SignJWT({ ...payload, exp })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

export async function verifyMazeToken(token: string): Promise<MazeToken | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as MazeToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function generateSeed(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function isTokenExpired(token: MazeToken): boolean {
  return Date.now() / 1000 > token.exp;
}

export function createStepToken(sessionId: string, trialId: string, step: number): Promise<string> {
  return signMazeToken({
    sessionId,
    trialId,
    step,
    seed: generateSeed()
  });
}