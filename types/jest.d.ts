import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveValue(value: string | number): R
      toBeVisible(): R
      toHaveStyle(css: Record<string, any> | string): R
      toBeChecked(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveClass(className: string): R
    }
  }
}