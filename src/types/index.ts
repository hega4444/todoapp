export interface TodoList {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  listId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FilterType = 'all' | 'pending' | 'completed';

export interface User {
  id: string;
  sessionToken: string;
  encryptionKey: string;
}