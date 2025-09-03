import { Todo, TodoList } from '@/types'

export const mockTodos: Todo[] = [
  {
    id: '1',
    text: 'Test todo 1',
    completed: false,
    listId: 'list1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    text: 'Test todo 2',
    completed: true,
    listId: 'list1',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
]

export const mockLists: TodoList[] = [
  {
    id: 'list1',
    name: 'Test List',
    color: '#3b82f6',
    createdAt: new Date('2024-01-01')
  }
]

export const mockFetch = (data: any, status = 200) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data)
    })
  )
}