import { render, screen, fireEvent, waitFor } from '../setup/test-utils'
import TodoItem from '@/components/TodoItem'
import { mockTodos, mockLists } from '../mocks/api'

const mockProps = {
  todo: mockTodos[0],
  list: mockLists[0],
  onToggle: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn()
}

describe('TodoItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders todo item correctly', () => {
    render(<TodoItem {...mockProps} />)
    
    expect(screen.getByText('Test todo 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete task/i })).toBeInTheDocument()
  })

  it('shows completed state correctly', () => {
    const completedTodo = { ...mockTodos[1], completed: true }
    render(<TodoItem {...mockProps} todo={completedTodo} />)
    
    const todoText = screen.getByText('Test todo 2')
    expect(todoText).toHaveStyle('text-decoration: line-through')
  })

  it('calls onToggle when checkbox is clicked', () => {
    render(<TodoItem {...mockProps} />)
    
    const checkbox = screen.getByRole('button').closest('button')
    fireEvent.click(checkbox!)
    
    expect(mockProps.onToggle).toHaveBeenCalledWith('1')
  })

  it('enters edit mode on double click', () => {
    render(<TodoItem {...mockProps} />)
    
    const todoText = screen.getByText('Test todo 1')
    fireEvent.doubleClick(todoText)
    
    expect(screen.getByDisplayValue('Test todo 1')).toBeInTheDocument()
  })

  it('calls onEdit when edit is submitted', async () => {
    render(<TodoItem {...mockProps} />)
    
    const todoText = screen.getByText('Test todo 1')
    fireEvent.doubleClick(todoText)
    
    const input = screen.getByDisplayValue('Test todo 1')
    fireEvent.change(input, { target: { value: 'Updated todo' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    await waitFor(() => {
      expect(mockProps.onEdit).toHaveBeenCalledWith('1', 'Updated todo')
    })
  })

  it('cancels edit on Escape key', async () => {
    render(<TodoItem {...mockProps} />)
    
    const todoText = screen.getByText('Test todo 1')
    fireEvent.doubleClick(todoText)
    
    const input = screen.getByDisplayValue('Test todo 1')
    fireEvent.change(input, { target: { value: 'Updated todo' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    
    await waitFor(() => {
      expect(screen.getByText('Test todo 1')).toBeInTheDocument()
      expect(screen.queryByDisplayValue('Updated todo')).not.toBeInTheDocument()
    })
  })

  it('shows delete button on hover', () => {
    render(<TodoItem {...mockProps} />)
    
    const todoItem = screen.getByText('Test todo 1').closest('div')!
    fireEvent.mouseEnter(todoItem)
    
    const deleteButton = screen.getByRole('button', { name: /delete task/i })
    expect(deleteButton).toBeVisible()
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<TodoItem {...mockProps} />)
    
    const todoItem = screen.getByText('Test todo 1').closest('div')!
    fireEvent.mouseEnter(todoItem)
    
    const deleteButton = screen.getByRole('button', { name: /delete task/i })
    fireEvent.click(deleteButton)
    
    expect(mockProps.onDelete).toHaveBeenCalledWith('1')
  })
})