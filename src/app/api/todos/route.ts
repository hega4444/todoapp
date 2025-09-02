import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';
import { EncryptionService } from '@/lib/encryption';

// Get all todos and lists
export async function GET(request: NextRequest) {
  try {
    const db = await mongodb.connect();
    
    // Get session token from query params to identify the user
    const url = new URL(request.url);
    const sessionToken = url.searchParams.get('sessionToken') || 'default';
    
    console.log('API Request - Session Token:', sessionToken);
    
    const [todos, lists] = await Promise.all([
      db.collection('todos').find({ sessionToken }).toArray(),
      db.collection('lists').find({ sessionToken }).toArray()
    ]);
    
    console.log('Found todos:', todos.length, 'Found lists:', lists.length);
    console.log('Sample todo sessionToken:', todos.length > 0 ? todos[0].sessionToken : 'none');
    console.log('Sample list sessionToken:', lists.length > 0 ? lists[0].sessionToken : 'none');

    // For new users, create default lists only if they have no lists and no todos
    if (lists.length === 0 && todos.length === 0) {
      const defaultLists = [
        { id: 'personal', name: 'Personal', color: '#3B82F6', createdAt: new Date(), sessionToken },
        { id: 'work', name: 'Work', color: '#EF4444', createdAt: new Date(), sessionToken },
        { id: 'shopping', name: 'Shopping', color: '#10B981', createdAt: new Date(), sessionToken }
      ];
      const result = await db.collection('lists').insertMany(defaultLists);
      const insertedLists = defaultLists.map((list, index) => ({
        ...list,
        _id: result.insertedIds[index]
      }));
      lists.push(...insertedLists);
    }

    // Decrypt todo texts for the client
    const decryptedTodos = todos.map(todo => {
      try {
        const decryptedText = EncryptionService.isEncrypted(todo.text) 
          ? EncryptionService.decrypt(todo.text, sessionToken)
          : todo.text; // Support for non-encrypted legacy todos
        return { ...todo, text: decryptedText, id: todo._id.toString(), _id: undefined };
      } catch (error) {
        console.error('Failed to decrypt todo text:', error);
        return { ...todo, text: '[Decryption Failed]', id: todo._id.toString(), _id: undefined };
      }
    });

    return NextResponse.json({ 
      todos: decryptedTodos,
      lists: lists.map(list => ({ ...list, id: list._id ? list._id.toString() : list.id, _id: undefined }))
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, listId, sessionToken } = body;

    if (!text || !listId) {
      return NextResponse.json(
        { error: 'Text and listId are required' },
        { status: 400 }
      );
    }

    const db = await mongodb.connect();
    
    // Encrypt the todo text before storing
    const encryptedText = EncryptionService.encrypt(text, sessionToken || 'default');
    
    const newTodo = {
      text: encryptedText,
      completed: false,
      listId,
      createdAt: new Date(),
      updatedAt: new Date(),
      sessionToken: sessionToken || 'default'
    };

    const result = await db.collection('todos').insertOne(newTodo);
    
    // Return the todo with decrypted text for the client
    return NextResponse.json({
      ...newTodo,
      text: text, // Return original unencrypted text to client
      id: result.insertedId.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}