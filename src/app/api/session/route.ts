import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EncryptionService } from '@/lib/encryption';

// Create or get user session
export async function GET() {
  const cookieStore = await cookies();
  let sessionToken = cookieStore.get('session-token')?.value;

  if (!sessionToken) {
    // Generate new larger session token (no need to store anything in DB)
    sessionToken = EncryptionService.generateSessionToken();
    console.log('Session API - Created new session:', sessionToken);
  } else {
    console.log('Session API - Returning existing session:', sessionToken);
  }

  const response = NextResponse.json({ sessionToken });
  
  // Set cookie for 30 days
  response.cookies.set('session-token', sessionToken, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return response;
}

// Create new session
export async function POST() {
  const sessionToken = EncryptionService.generateSessionToken();
  const response = NextResponse.json({ sessionToken });
  
  response.cookies.set('session-token', sessionToken, {
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return response;
}