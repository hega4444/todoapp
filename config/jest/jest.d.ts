import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveValue(value: string | number): R
      toBeVisible(): R
      toHaveStyle(css: Record<string, any> | string): R
    }
  }
}