import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import mongodb from '@/lib/mongodb';
import { EncryptionService } from '@/lib/encryption';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Validate MongoDB ObjectId
 */
function validateObjectId(id: string) {
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid todo ID' }, { status: 400 });
  }
  return null;
}

/**
 * Decrypt todo for response
 */
function decryptTodoResponse(todo: any, sessionToken: string) {
  const response = { ...todo, id: todo._id.toString(), _id: undefined };

  if (todo.text && EncryptionService.isEncrypted(todo.text)) {
    try {
      response.text = EncryptionService.decrypt(todo.text, sessionToken);
    } catch (error) {
      console.error('Failed to decrypt todo:', error);
      response.text = '[Decryption Failed]';
    }
  }

  return response;
}

/**
 * Update todo with encrypted text storage
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { text, completed } = await request.json();

    const validationError = validateObjectId(id);
    if (validationError) return validationError;

    const db = await mongodb.connect();

    // Get existing todo for session token
    const existingTodo = await db
      .collection('todos')
      .findOne({ _id: new ObjectId(id) });
    if (!existingTodo) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.TODO_NOT_FOUND },
        { status: 404 }
      );
    }

    const updateData: any = { updatedAt: new Date() };

    if (text !== undefined) {
      updateData.text = EncryptionService.encrypt(
        text,
        existingTodo.sessionToken
      );
    }
    if (completed !== undefined) {
      updateData.completed = completed;
    }

    const result = await db
      .collection('todos')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

    if (!result) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.TODO_NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json(
      decryptTodoResponse(result, existingTodo.sessionToken)
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    );
  }
}

/**
 * Delete todo by ID
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const validationError = validateObjectId(id);
    if (validationError) return validationError;

    const db = await mongodb.connect();
    const result = await db
      .collection('todos')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.TODO_NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    );
  }
}
