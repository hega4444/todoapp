import { NextRequest } from 'next/server';

/**
 * Get session token from Authorization header
 * Returns null if no valid session token is provided
 */
export function getSessionTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}