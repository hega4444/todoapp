import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Delete a specific list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    const db = await mongodb.connect();
    
    // Get session token from query params to identify the user
    const url = new URL(request.url);
    const sessionToken = url.searchParams.get('sessionToken') || 'default';
    
    // Delete all todos in this list for this session first
    await db.collection('todos').deleteMany({ listId: id, sessionToken });
    
    // Delete the list itself for this session
    let query: any = { sessionToken };
    
    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
    } else {
      query.id = id;
    }
    
    const result = await db.collection('lists').deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}