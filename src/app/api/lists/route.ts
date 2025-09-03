import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';
import { TodoListDocument } from '@/types';

/**
 * Format list for client response
 */
function formatList(list: any): { id: string; name: string; color: string; createdAt: Date } {
  return { 
    id: list._id?.toString() || list.id || '', 
    name: list.name, 
    color: list.color, 
    createdAt: list.createdAt 
  };
}

/**
 * Get session token from Authorization header
 */
function getSessionTokenFromHeader(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return 'default';
}

/**
 * Get all lists for a user session
 */
export async function GET(request: NextRequest) {
  try {
    const db = await mongodb.connect();
    const sessionToken = getSessionTokenFromHeader(request);
    
    const lists = await db.collection('lists').find({ sessionToken }).toArray();
    return NextResponse.json(lists.map(formatList));
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Create a new list
 */
export async function POST(request: NextRequest) {
  try {
    const { name, color } = await request.json();

    if (!name?.trim() || !color?.trim()) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      );
    }

    const db = await mongodb.connect();
    const sessionToken = getSessionTokenFromHeader(request);
    
    const newList: Omit<TodoListDocument, '_id'> = {
      name: name.trim(),
      color: color.trim(),
      createdAt: new Date(),
      sessionToken
    };

    const result = await db.collection('lists').insertOne(newList);

    return NextResponse.json({
      ...newList,
      id: result.insertedId.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}