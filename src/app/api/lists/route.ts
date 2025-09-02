import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';

/**
 * Format list for client response
 */
function formatList(list: any) {
  return { ...list, id: list._id ? list._id.toString() : list.id, _id: undefined };
}

/**
 * Get all lists for a user session
 */
export async function GET(request: NextRequest) {
  try {
    const db = await mongodb.connect();
    const url = new URL(request.url);
    const sessionToken = url.searchParams.get('sessionToken') || 'default';
    
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
    const { name, color, sessionToken } = await request.json();

    if (!name?.trim() || !color?.trim()) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      );
    }

    const db = await mongodb.connect();
    const newList = {
      name: name.trim(),
      color: color.trim(),
      createdAt: new Date(),
      sessionToken: sessionToken || 'default'
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