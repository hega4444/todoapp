import { 
  Todo, 
  TodoList, 
  ConnectionStatusCallback, 
  GetTodosAndListsResponse,
  AppError,
  DEFAULT_SESSION_TOKEN 
} from '@/types';
import { API_ENDPOINTS, ERROR_MESSAGES } from './constants';

interface ApiErrorResponse {
  error: string;
}

interface SessionResponse {
  sessionToken: string;
}

class ApiService {
  private sessionToken: string | null = null;
  private connectionCallback: ConnectionStatusCallback | null = null;

  setConnectionCallback(callback: ConnectionStatusCallback): void {
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
      if (error instanceof TypeError && error.message.includes('fetch')) {
        this.connectionCallback?.setOffline();
      } else {
        this.connectionCallback?.setError();
      }
      throw error;
    }
  }

  private async handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData: ApiErrorResponse = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use the default error message
      }
      throw new AppError(errorMessage, response.status.toString());
    }
    
    return response.json() as Promise<T>;
  }

  async getSessionToken(): Promise<string> {
    if (!this.sessionToken) {
      try {
        const response = await this.handleFetch(API_ENDPOINTS.SESSION);
        const data = await this.handleApiResponse<SessionResponse>(response);
        this.sessionToken = data.sessionToken;
      } catch (error) {
        console.warn(ERROR_MESSAGES.SESSION_TOKEN_FAILED);
        this.sessionToken = DEFAULT_SESSION_TOKEN;
      }
    }
    return this.sessionToken;
  }

  async getTodosAndLists(): Promise<GetTodosAndListsResponse> {
    const sessionToken = await this.getSessionToken();
    const response = await this.handleFetch(API_ENDPOINTS.TODOS, {
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await this.handleApiResponse<{
      todos: Array<Omit<Todo, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }>;
      lists: Array<Omit<TodoList, 'createdAt'> & { createdAt: string }>;
    }>(response);
    
    return {
      todos: data.todos.map((todo) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt)
      })),
      lists: data.lists.map((list) => ({
        ...list,
        createdAt: new Date(list.createdAt)
      }))
    };
  }

  async createTodo(text: string, listId: string): Promise<Todo> {
    const sessionToken = await this.getSessionToken();
    const response = await this.handleFetch(API_ENDPOINTS.TODOS, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({ text, listId })
    });
    
    const data = await this.handleApiResponse<
      Omit<Todo, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }
    >(response);
    
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }

  async updateTodo(id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>): Promise<Todo> {
    const response = await this.handleFetch(`${API_ENDPOINTS.TODOS}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    return this.handleApiResponse<Todo>(response);
  }

  async deleteTodo(id: string): Promise<void> {
    const response = await this.handleFetch(`${API_ENDPOINTS.TODOS}/${id}`, {
      method: 'DELETE'
    });
    
    await this.handleApiResponse<{ success: boolean }>(response);
  }

  async getLists(): Promise<TodoList[]> {
    const response = await this.handleFetch(API_ENDPOINTS.LISTS);
    const data = await this.handleApiResponse<Array<Omit<TodoList, 'createdAt'> & { createdAt: string }>>(response);
    
    return data.map((list) => ({
      ...list,
      createdAt: new Date(list.createdAt)
    }));
  }

  async createList(name: string, color: string): Promise<TodoList> {
    const sessionToken = await this.getSessionToken();
    const response = await this.handleFetch(API_ENDPOINTS.LISTS, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({ name, color })
    });
    
    const data = await this.handleApiResponse<
      Omit<TodoList, 'createdAt'> & { createdAt: string }
    >(response);
    
    return {
      ...data,
      createdAt: new Date(data.createdAt)
    };
  }

  async deleteList(id: string): Promise<void> {
    const sessionToken = await this.getSessionToken();
    const response = await this.handleFetch(`${API_ENDPOINTS.LISTS}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });
    
    await this.handleApiResponse<{ success: boolean }>(response);
  }
}

export const apiService = new ApiService();