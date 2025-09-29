import { createHash } from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export function generateAdminToken(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  const data = `${timestamp}-${random}-admin`;
  return createHash('sha256').update(data).digest('hex');
}

export function verifyAdminPassword(password: string): boolean {
  if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD environment variable not set');
    return false;
  }
  return password === ADMIN_PASSWORD;
}

export function isAdminTokenValid(token: string): boolean {
  // Simple token validation - in production, you might want to store tokens in database
  // with expiration times
  return token && token.length === 64; // SHA-256 hash length
}

export function setAdminCookie(res: any, token: string): void {
  res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`);
}

export function clearAdminCookie(res: any): void {
  res.setHeader('Set-Cookie', `admin_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`);
}

export function getAdminTokenFromRequest(req: any): string | null {
  const cookies = req.headers.cookie || '';
  const match = cookies.match(/admin_token=([^;]+)/);
  return match ? match[1] : null;
}