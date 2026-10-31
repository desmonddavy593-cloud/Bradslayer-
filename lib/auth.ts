import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'bradslayer_admin';
export const USER_COOKIE = 'bradslayer_user';
const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'dev-only-change-me';
const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('hex');

export function createSession(id: string) { return `${id}.${sign(id)}`; }
export function readSession(): string | null {
  const value = cookies().get(USER_COOKIE)?.value || '';
  const [id, signature] = value.split('.');
  if (!id || !signature) return null;
  const expected = sign(id);
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? id : null;
}
export function isAdmin() {
  const value = cookies().get(ADMIN_COOKIE)?.value || '';
  const expected = sign('admin');
  return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
export function adminCookie() { return { name: ADMIN_COOKIE, value: sign('admin'), httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 12, path: '/' }; }
export function userCookie(id: string) { return { name: USER_COOKIE, value: createSession(id), httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 30, path: '/' }; }
