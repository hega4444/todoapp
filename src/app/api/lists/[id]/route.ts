import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getSessionTokenFromHeader } from '@/app/api/utils';


/**
 * Delete a list and all its associated todos
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    const db = await mongodb.connect();
    const sessionToken = getSessionTokenFromHeader(request);
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Delete all todos in this list first
    await db.collection('todos').deleteMany({ listId: id, sessionToken });

    // Build query for list deletion
    const query: { sessionToken: string; _id?: ObjectId; id?: string } = {
      sessionToken,
    };
    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
    } else {
      query.id = id;
    }

    const result = await db.collection('lists').deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
