import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';

// Get all lists
export async function GET(request: NextRequest) {
  try {
    const db = await mongodb.connect();
    
    // Get session token from query params to identify the user
    const url = new URL(request.url);
    const sessionToken = url.searchParams.get('sessionToken') || 'default';
    
    const lists = await db.collection('lists').find({ sessionToken }).toArray();

    return NextResponse.json(
      lists.map(list => ({ ...list, id: list._id ? list._id.toString() : list.id, _id: undefined }))
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color, sessionToken } = body;

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      );
    }

    const db = await mongodb.connect();
    const newList = {
      name,
      color,
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