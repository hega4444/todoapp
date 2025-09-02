import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EncryptionService } from '@/lib/encryption';

const COOKIE_OPTIONS = {
  maxAge: 30 * 24 * 60 * 60, // 30 days
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const
};

/**
 * Get existing session or create new one
 */
export async function GET() {
  const cookieStore = await cookies();
  let sessionToken = cookieStore.get('session-token')?.value;

  if (!sessionToken) {
    sessionToken = EncryptionService.generateSessionToken();
  }

  const response = NextResponse.json({ sessionToken });
  response.cookies.set('session-token', sessionToken, COOKIE_OPTIONS);

  return response;
}

/**
 * Create new session (force new token)
 */
export async function POST() {
  const sessionToken = EncryptionService.generateSessionToken();
  const response = NextResponse.json({ sessionToken });
  response.cookies.set('session-token', sessionToken, COOKIE_OPTIONS);

  return response;
}