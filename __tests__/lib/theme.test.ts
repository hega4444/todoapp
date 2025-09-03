import { getSystemTheme, applyTheme } from '@/lib/theme'

describe('Theme utilities', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
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

  describe('getSystemTheme', () => {
    it('returns dark when system prefers dark mode', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
        })),
      })

      const theme = getSystemTheme()
      expect(theme).toBe('dark')
    })

    it('returns light when system does not prefer dark mode', () => {
      const theme = getSystemTheme()
      expect(theme).toBe('light')
    })

    it('returns light as fallback when matchMedia is not available', () => {
      delete (window as any).matchMedia

      const theme = getSystemTheme()
      expect(theme).toBe('light')
    })
  })

  describe('applyTheme', () => {
    it('sets data-theme attribute to light', () => {
      applyTheme('light')
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('sets data-theme attribute to dark', () => {
      applyTheme('dark')
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('overwrites existing theme attribute', () => {
      document.documentElement.setAttribute('data-theme', 'light')
      applyTheme('dark')
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })
  })
})