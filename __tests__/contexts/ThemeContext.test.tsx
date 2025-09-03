import { render, screen, fireEvent } from '../setup/test-utils'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'

const TestComponent = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  it('provides default light theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('toggles between light and dark themes', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    const toggleButton = screen.getByText('Toggle Theme')
    const themeDisplay = screen.getByTestId('theme')
    
    expect(themeDisplay).toHaveTextContent('light')
    
    fireEvent.click(toggleButton)
    expect(themeDisplay).toHaveTextContent('dark')
    
    fireEvent.click(toggleButton)
    expect(themeDisplay).toHaveTextContent('light')
  })

  it('loads theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('saves theme to localStorage when changed', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    const toggleButton = screen.getByText('Toggle Theme')
    fireEvent.click(toggleButton)
    
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('sets data-theme attribute on document', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    const toggleButton = screen.getByText('Toggle Theme')
    fireEvent.click(toggleButton)
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('uses system preference when no saved theme', () => {
    // Mock system preference for dark mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
      })),
    })
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('ignores invalid theme values from localStorage', () => {
    localStorage.setItem('theme', 'invalid')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('throws error when useTheme is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useTheme must be used within a ThemeProvider')
    
    consoleError.mockRestore()
  })
})