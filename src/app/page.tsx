'use client';

import AddTodo from '@/components/AddTodo';
import TodoListComponent from '@/components/TodoList';
import ThemeToggle from '@/components/ThemeToggle';
import { TodoProvider, useTodoContext } from '@/contexts/TodoContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

function HomeContent() {
  const { loading } = useTodoContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--interactive-primary)' }}
          />
          <p style={{ color: 'var(--text-secondary)' }}>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-radial">
      <ThemeToggle />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            # TodoApp
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Organize your tasks efficiently
          </p>
        </div>
        
        <AddTodo />
        <TodoListComponent />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <TodoProvider>
        <HomeContent />
      </TodoProvider>
    </ThemeProvider>
  );
}