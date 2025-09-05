import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';
import { EncryptionService } from '@/lib/encryption';
import { DEFAULT_LISTS } from '@/lib/constants';
import { getSessionTokenFromHeader, formatList } from '@/app/api/utils';
import { TodoDocument, TodoListDocument, Todo } from '@/types';

/**
 * Create default lists for new users
 */
async function createDefaultLists(
  db: any,
  sessionToken: string,
  lists: TodoListDocument[]
) {
  const defaultLists = DEFAULT_LISTS.map((list) => ({
    ...list,
    createdAt: new Date(),
    sessionToken,
  }));

  const result = await db.collection('lists').insertMany(defaultLists);
  const insertedLists = defaultLists.map((list, index) => ({
    ...list,
    _id: result.insertedIds[index],
  }));

  lists.push(...insertedLists);
}

/**
 * Decrypt todo text and format for client
 */
function decryptTodo(todo: TodoDocument, sessionToken: string): Todo {
  try {
    const decryptedText = EncryptionService.isEncrypted(todo.text)
      ? EncryptionService.decrypt(todo.text, sessionToken)
      : todo.text; // Support legacy unencrypted todos

    return {
      id: todo._id?.toString() || '',
      text: decryptedText,
      completed: todo.completed,
      listId: todo.listId,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
  } catch (error) {
    console.error('Failed to decrypt todo:', error);
    return {
      id: todo._id?.toString() || '',
      text: '[Decryption Failed]',
      completed: todo.completed,
      listId: todo.listId,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await mongodb.connect();
    const sessionToken = getSessionTokenFromHeader(request);

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const [todos, lists] = await Promise.all([
      db.collection<TodoDocument>('todos').find({ sessionToken }).toArray(),
      db.collection<TodoListDocument>('lists').find({ sessionToken }).toArray(),
    ]);

    // Create default lists for new users
    if (lists.length === 0 && todos.length === 0) {
      await createDefaultLists(db, sessionToken, lists);
    }

    return NextResponse.json({
      todos: todos.map((todo) => decryptTodo(todo, sessionToken)),
      lists: lists.map(formatList),
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create a new todo with encrypted text
 */
export async function POST(request: NextRequest) {
  try {
    const { text, listId } = await request.json();

    if (!text?.trim() || !listId) {
      return NextResponse.json(
        { error: 'Text and listId are required' },
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

    const newTodo = {
      text: EncryptionService.encrypt(text, sessionToken),
      completed: false,
      listId,
      createdAt: new Date(),
      updatedAt: new Date(),
      sessionToken,
    };

    const result = await db.collection('todos').insertOne(newTodo);

    // Return decrypted todo for client
    return NextResponse.json(
      {
        ...newTodo,
        text, // Return original unencrypted text
        id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
