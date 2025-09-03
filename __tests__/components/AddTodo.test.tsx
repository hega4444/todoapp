import { render, screen, fireEvent, waitFor } from '../setup/test-utils'
import AddTodo from '@/components/AddTodo'
import { mockLists } from '../mocks/api'

const mockProps = {
  lists: mockLists,
  selectedListId: 'list1',
  onAddTodo: jest.fn(),
  onCreateList: jest.fn(),
  onSelectList: jest.fn()
}

describe('AddTodo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders add todo form correctly', () => {
    render(<AddTodo {...mockProps} />)
    
    expect(screen.getByPlaceholderText('What needs to be done? ...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
    expect(screen.getByText('Test List')).toBeInTheDocument()
  })

  it('calls onAddTodo when form is submitted', async () => {
    render(<AddTodo {...mockProps} />)
    
    const input = screen.getByPlaceholderText('What needs to be done? ...')
    const addButton = screen.getByRole('button', { name: /add/i })
    
    fireEvent.change(input, { target: { value: 'New todo item' } })
    fireEvent.click(addButton)
    
    await waitFor(() => {
      expect(mockProps.onAddTodo).toHaveBeenCalledWith('New todo item', 'list1')
    })
    
    expect(input).toHaveValue('')
  })

  it('does not submit empty todos', () => {
    render(<AddTodo {...mockProps} />)
    
    const addButton = screen.getByRole('button', { name: /add/i })
    fireEvent.click(addButton)
    
    expect(mockProps.onAddTodo).not.toHaveBeenCalled()
  })

  it('opens list dropdown when clicked', () => {
    render(<AddTodo {...mockProps} />)
    
    const listButton = screen.getByText('Test List').closest('button')!
    fireEvent.click(listButton)
    
    expect(screen.getByText('Create new list')).toBeInTheDocument()
  })

  it('changes selected list when dropdown option is clicked', () => {
    const multipleListsProps = {
      ...mockProps,
      lists: [
        ...mockLists,
        { _id: 'list2', name: 'Second List', color: '#ef4444', createdAt: new Date(), updatedAt: new Date() }
      ]
    }
    
    render(<AddTodo {...multipleListsProps} />)
    
    const listButton = screen.getByText('Test List').closest('button')!
    fireEvent.click(listButton)
    
    const secondListOption = screen.getByText('Second List')
    fireEvent.click(secondListOption)
    
    expect(mockProps.onSelectList).toHaveBeenCalledWith('list2')
  })

  it('shows create new list form when clicked', async () => {
    render(<AddTodo {...mockProps} />)
    
    const listButton = screen.getByText('Test List').closest('button')!
    fireEvent.click(listButton)
    
    const createButton = screen.getByText('Create new list')
    fireEvent.click(createButton)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('List name')).toBeInTheDocument()
    })
  })

  it('creates new list when form is submitted', async () => {
    render(<AddTodo {...mockProps} />)
    
    const listButton = screen.getByText('Test List').closest('button')!
    fireEvent.click(listButton)
    
    const createButton = screen.getByText('Create new list')
    fireEvent.click(createButton)
    
    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('List name')
      fireEvent.change(nameInput, { target: { value: 'New List' } })
      
      const submitButton = screen.getByText('Create')
      fireEvent.click(submitButton)
    })
    
    expect(mockProps.onCreateList).toHaveBeenCalledWith('New List', expect.any(String))
  })

  it('cancels list creation', async () => {
    render(<AddTodo {...mockProps} />)
    
    const listButton = screen.getByText('Test List').closest('button')!
    fireEvent.click(listButton)
    
    const createButton = screen.getByText('Create new list')
    fireEvent.click(createButton)
    
    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
    })
    
    expect(screen.queryByPlaceholderText('List name')).not.toBeInTheDocument()
  })

  it('submits todo on Enter key press', async () => {
    render(<AddTodo {...mockProps} />)
    
    const input = screen.getByPlaceholderText('What needs to be done? ...')
    fireEvent.change(input, { target: { value: 'Todo via Enter' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    await waitFor(() => {
      expect(mockProps.onAddTodo).toHaveBeenCalledWith('Todo via Enter', 'list1')
    })
  })
})