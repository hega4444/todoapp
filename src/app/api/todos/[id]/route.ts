import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import mongodb from '@/lib/mongodb';
import { EncryptionService } from '@/lib/encryption';

// Update todo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const { text, completed } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid todo ID' },
        { status: 400 }
      );
    }

    const db = await mongodb.connect();
    
    // First, get the existing todo to get the session token for encryption
    const existingTodo = await db.collection('todos').findOne({ _id: new ObjectId(id) });
    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    const updateData: any = { updatedAt: new Date() };
    
    if (text !== undefined) {
      // Encrypt the text before storing
      updateData.text = EncryptionService.encrypt(text, existingTodo.sessionToken);
    }
    if (completed !== undefined) updateData.completed = completed;

    const result = await db.collection('todos').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    // Decrypt text for response if it was updated
    const responseData: any = { ...result, id: result._id.toString(), _id: undefined };
    if (result.text && EncryptionService.isEncrypted(result.text)) {
      try {
        responseData.text = EncryptionService.decrypt(result.text, existingTodo.sessionToken);
      } catch (error) {
        console.error('Failed to decrypt updated todo text:', error);
        responseData.text = '[Decryption Failed]';
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid todo ID' },
        { status: 400 }
      );
    }

    const db = await mongodb.connect();
    const result = await db.collection('todos').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}