export const themes = {
  light: {
    // Background colors
    background: {
      primary: 'var(--bg-primary)',
      secondary: 'var(--bg-secondary)',
      tertiary: 'var(--bg-tertiary)',
    },
    // Text colors
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      muted: 'var(--text-muted)',
    },
    // Border colors
    border: {
      primary: 'var(--border-primary)',
      secondary: 'var(--border-secondary)',
    },
    // Interactive colors
    interactive: {
      primary: 'var(--interactive-primary)',
      primaryHover: 'var(--interactive-primary-hover)',
      secondary: 'var(--interactive-secondary)',
      secondaryHover: 'var(--interactive-secondary-hover)',
    },
    // Status colors
    status: {
      success: 'var(--status-success)',
      error: 'var(--status-error)',
      warning: 'var(--status-warning)',
    },
  },
  dark: {
    // Same structure as light theme
    background: {
      primary: 'var(--bg-primary)',
      secondary: 'var(--bg-secondary)',
      tertiary: 'var(--bg-tertiary)',
    },
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      muted: 'var(--text-muted)',
    },
    border: {
      primary: 'var(--border-primary)',
      secondary: 'var(--border-secondary)',
    },
    interactive: {
      primary: 'var(--interactive-primary)',
      primaryHover: 'var(--interactive-primary-hover)',
      secondary: 'var(--interactive-secondary)',
      secondaryHover: 'var(--interactive-secondary-hover)',
    },
    status: {
      success: 'var(--status-success)',
      error: 'var(--status-error)',
      warning: 'var(--status-warning)',
    },
  },
} as const;

export type Theme = typeof themes.light;
export type ThemeName = keyof typeof themes;

export function getSystemTheme(): ThemeName {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}

export function applyTheme(theme: ThemeName): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
