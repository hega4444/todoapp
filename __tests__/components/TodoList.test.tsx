import { render, screen, fireEvent } from '../setup/test-utils'
import TodoList from '@/components/TodoList'
import { mockTodos, mockLists } from '../mocks/api'

const mockProps = {
  todos: mockTodos,
  lists: mockLists,
  completionFilter: 'all' as const,
  listFilter: 'all',
  onToggleTodo: jest.fn(),
  onEditTodo: jest.fn(),
  onDeleteTodo: jest.fn(),
  onDeleteList: jest.fn(),
  onSetCompletionFilter: jest.fn(),
  onSetListFilter: jest.fn()
}

describe('TodoList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders todo list with correct stats', () => {
    render(<TodoList {...mockProps} />)
    
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('1 pending')).toBeInTheDocument()
    expect(screen.getByText('1 completed')).toBeInTheDocument()
    expect(screen.getByText('Test todo 1')).toBeInTheDocument()
    expect(screen.getByText('Test todo 2')).toBeInTheDocument()
  })

  it('filters todos by completion status', () => {
    render(<TodoList {...mockProps} completionFilter="pending" />)
    
    const pendingButton = screen.getByText('pending')
    expect(pendingButton).toBeInTheDocument()
    
    expect(screen.getByText('Test todo 1')).toBeInTheDocument()
    expect(screen.queryByText('Test todo 2')).not.toBeInTheDocument() // Filtered out
  })

  it('changes completion filter when button is clicked', () => {
    render(<TodoList {...mockProps} />)
    
    const completedButton = screen.getByText('completed')
    fireEvent.click(completedButton)
    
    expect(mockProps.onSetCompletionFilter).toHaveBeenCalledWith('completed')
  })

  it('opens list filter dropdown', () => {
    render(<TodoList {...mockProps} />)
    
    const listFilterButton = screen.getByText('All tasks').closest('button')!
    fireEvent.click(listFilterButton)
    
    expect(screen.getByText('Test List')).toBeInTheDocument()
  })

  it('changes list filter when option is selected', async () => {
    render(<TodoList {...mockProps} />)
    
    const listFilterButton = screen.getByText('All tasks').closest('button')!
    fireEvent.click(listFilterButton)
    
    // Find the dropdown option button containing 'Test List'
    const listOptions = screen.getAllByText('Test List')
    const dropdownOption = listOptions.find(option => 
      option.closest('button') && option.closest('button') !== listFilterButton
    )?.closest('button')
    
    expect(dropdownOption).toBeDefined()
    fireEvent.click(dropdownOption!)
    
    expect(mockProps.onSetListFilter).toHaveBeenCalledWith('list1')
  })

  it('shows empty state when no todos match filters', () => {
    render(<TodoList {...mockProps} todos={[]} />)
    
    expect(screen.getByText('No tasks found')).toBeInTheDocument()
    expect(screen.getByText('Get started by adding your first task above!')).toBeInTheDocument()
  })

  it('shows filtered empty state message', () => {
    render(<TodoList {...mockProps} todos={[]} completionFilter="completed" />)
    
    expect(screen.getByText('No tasks found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters to see more tasks.')).toBeInTheDocument()
  })

  it('shows delete list button when specific list is selected', () => {
    render(<TodoList {...mockProps} listFilter="list1" />)
    
    expect(screen.getByText('Delete List')).toBeInTheDocument()
  })

  it('does not show delete list button for all lists view', () => {
    render(<TodoList {...mockProps} listFilter="all" />)
    
    expect(screen.queryByText('Delete List')).not.toBeInTheDocument()
  })

  it('shows delete confirmation dialog', () => {
    render(<TodoList {...mockProps} listFilter="list1" />)
    
    const deleteButton = screen.getByText('Delete List')
    fireEvent.click(deleteButton)
    
    expect(screen.getByText('Delete "Test List" List?')).toBeInTheDocument()
    expect(screen.getByText(/This will permanently delete the list and all/)).toBeInTheDocument()
  })

  it('calls onDeleteList when confirmed', () => {
    render(<TodoList {...mockProps} listFilter="list1" />)
    
    const deleteButton = screen.getByText('Delete List')
    fireEvent.click(deleteButton)
    
    const confirmButton = screen.getByText('Delete')
    fireEvent.click(confirmButton)
    
    expect(mockProps.onDeleteList).toHaveBeenCalledWith('list1')
    expect(mockProps.onSetListFilter).toHaveBeenCalledWith('all')
  })

  it('cancels delete confirmation', () => {
    render(<TodoList {...mockProps} listFilter="list1" />)
    
    const deleteButton = screen.getByText('Delete List')
    fireEvent.click(deleteButton)
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(mockProps.onDeleteList).not.toHaveBeenCalled()
    expect(screen.queryByText('Delete "Test List" List?')).not.toBeInTheDocument()
  })

  it('shows correct task count in footer', () => {
    render(<TodoList {...mockProps} />)
    
    expect(screen.getByText('Showing 2 of 2 tasks')).toBeInTheDocument()
  })
})