import { NextRequest } from 'next/server';
import { TodoListDocument, TodoList } from '@/types';

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

/**
 * Format list for client response (converts _id to id)
 */
export function formatList(list: TodoListDocument): TodoList {
  return {
    id: list._id?.toString() || '',
    name: list.name,
    color: list.color,
    createdAt: list.createdAt,
  };
}
