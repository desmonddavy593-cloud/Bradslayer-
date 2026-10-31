import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
const COOKIE = 'bradslayer_admin';
const secret = () => process.env.ADMIN_PASSWORD || 'dev-only-change-me';
export function signAdmin() { return createHmac('sha256', secret()).update('bradslayer-admin').digest('hex'); }
export function isAdmin() { const value = cookies().get(COOKIE)?.value || ''; const expected = signAdmin(); return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected)); }
export function adminCookie() { return { name:COOKIE, value:signAdmin(), httpOnly:true, sameSite:'lax' as const, secure:process.env.NODE_ENV === 'production', maxAge:60*60*12, path:'/' }; }
export { COOKIE };
