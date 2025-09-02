import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';

// Admin endpoint for database operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionToken } = body;
    
    const db = await mongodb.connect();
    
    switch (action) {
      case 'clear_all':
        // Delete all todos and lists
        await db.collection('todos').deleteMany({});
        await db.collection('lists').deleteMany({});
        return NextResponse.json({ 
          message: 'All data cleared successfully',
          action: 'clear_all' 
        });
        
      case 'update_session_tokens':
        // Update all existing records to use the provided session token
        if (!sessionToken) {
          return NextResponse.json({ error: 'Session token required for update' }, { status: 400 });
        }
        
        const [todoUpdate, listUpdate] = await Promise.all([
          db.collection('todos').updateMany({}, { $set: { sessionToken } }),
          db.collection('lists').updateMany({}, { $set: { sessionToken } })
        ]);
        
        return NextResponse.json({
          message: 'Session tokens updated successfully',
          action: 'update_session_tokens',
          updated: {
            todos: todoUpdate.modifiedCount,
            lists: listUpdate.modifiedCount
          }
        });
        
      case 'get_stats':
        // Get database statistics
        const [todoCount, listCount, todoSessions, listSessions] = await Promise.all([
          db.collection('todos').countDocuments({}),
          db.collection('lists').countDocuments({}),
          db.collection('todos').distinct('sessionToken'),
          db.collection('lists').distinct('sessionToken')
        ]);
        
        return NextResponse.json({
          stats: {
            todos: todoCount,
            lists: listCount,
            todoSessions,
            listSessions
          }
        });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Database admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get current database stats
export async function GET() {
  try {
    const db = await mongodb.connect();
    
    const [todoCount, listCount, todoSessions, listSessions] = await Promise.all([
      db.collection('todos').countDocuments({}),
      db.collection('lists').countDocuments({}),
      db.collection('todos').distinct('sessionToken'),
      db.collection('lists').distinct('sessionToken')
    ]);
    
    return NextResponse.json({
      stats: {
        todos: todoCount,
        lists: listCount,
        todoSessions,
        listSessions
      }
    });
  } catch (error) {
    console.error('Database stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}