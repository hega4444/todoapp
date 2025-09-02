import { Todo, TodoList } from '@/types';

type ConnectionStatusCallback = {
  setOnline: () => void;
  setError: () => void;
  setOffline: () => void;
};

class ApiService {
  private baseUrl = '/api';
  private sessionToken: string | null = null;
  private connectionCallback: ConnectionStatusCallback | null = null;

  setConnectionCallback(callback: ConnectionStatusCallback) {
    this.connectionCallback = callback;
  }

  private async handleFetch(url: string, options?: RequestInit): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        this.connectionCallback?.setOnline();
      } else if (response.status >= 500) {
        this.connectionCallback?.setError();
      }
      
      return response;
    } catch (error) {
      // Network error or server unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        this.connectionCallback?.setOffline();
      } else {
        this.connectionCallback?.setError();
      }
      throw error;
    }
  }

  async getSessionToken(): Promise<string> {
    if (!this.sessionToken) {
      const response = await this.handleFetch(`${this.baseUrl}/session`);
      const data = await response.json();
      this.sessionToken = data.sessionToken;
    }
    return this.sessionToken!;
  }

  async getTodosAndLists(): Promise<{ todos: Todo[], lists: TodoList[] }> {
    const sessionToken = await this.getSessionToken();
    const response = await this.handleFetch(`${this.baseUrl}/todos?sessionToken=${sessionToken}`);
    if (!response.ok) throw new Error('Failed to fetch todos and lists');
    return response.json();
  }

  async createTodo(text: string, listId: string): Promise<Todo> {
    const sessionToken = await this.getSessionToken();
    const response = await this.handleFetch(`${this.baseUrl}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, listId, sessionToken })
    });
    if (!response.ok) throw new Error('Failed to create todo');
    return response.json();
  }

  async updateTodo(id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>): Promise<Todo> {
    const response = await this.handleFetch(`${this.baseUrl}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update todo failed:', response.status, errorText);
      throw new Error(`Failed to update todo: ${response.status}`);
    }
    const result = await response.json();
    return result;
  }

  async deleteTodo(id: string): Promise<void> {
    const response = await this.handleFetch(`${this.baseUrl}/todos/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete todo');
  }

  async getLists(): Promise<TodoList[]> {
    const response = await this.handleFetch(`${this.baseUrl}/lists`);
    if (!response.ok) throw new Error('Failed to fetch lists');
    return response.json();
  }

  async createList(name: string, color: string): Promise<TodoList> {
    const sessionToken = await this.getSessionToken();
    const response = await this.handleFetch(`${this.baseUrl}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color, sessionToken })
    });
    if (!response.ok) throw new Error('Failed to create list');
    return response.json();
  }

  async deleteList(id: string): Promise<void> {
    const sessionToken = await this.getSessionToken();
    const response = await this.handleFetch(`${this.baseUrl}/lists/${id}?sessionToken=${sessionToken}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete list');
  }
}

export const apiService = new ApiService();