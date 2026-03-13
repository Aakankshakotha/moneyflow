import type { ReactNode } from 'react'
import { useMemo } from 'react'
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material'
import { useTheme as useAppTheme } from '@/contexts/ThemeContext'

interface MuiAppThemeProviderProps {
  children: ReactNode
}

export function MuiAppThemeProvider({
  children,
}: MuiAppThemeProviderProps): JSX.Element {
  const { theme } = useAppTheme()

  const isDark = theme === 'dark'

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          primary: {
            main: isDark ? '#fb923c' : '#f97316',
            dark: isDark ? '#f97316' : '#ea580c',
            light: isDark ? '#fdba74' : '#fb923c',
            contrastText: '#ffffff',
          },
          secondary: {
            main: isDark ? '#8a8a92' : '#6b7280',
            dark: isDark ? '#6b7280' : '#4b5563',
            light: isDark ? '#b3b3b8' : '#9ca3af',
            contrastText: '#ffffff',
          },
          error: {
            main: isDark ? '#f87171' : '#dc2626',
            light: isDark ? '#fca5a5' : '#ef4444',
            dark: isDark ? '#ef4444' : '#b91c1c',
            contrastText: '#ffffff',
          },
          success: {
            main: isDark ? '#4ade80' : '#16a34a',
            light: isDark ? '#86efac' : '#22c55e',
            dark: isDark ? '#22c55e' : '#15803d',
            contrastText: '#ffffff',
          },
          warning: {
            main: isDark ? '#fbbf24' : '#d97706',
            light: isDark ? '#fcd34d' : '#f59e0b',
            dark: isDark ? '#f59e0b' : '#b45309',
            contrastText: '#ffffff',
          },
          info: {
            main: isDark ? '#38bdf8' : '#0284c7',
            light: isDark ? '#7dd3fc' : '#0ea5e9',
            dark: isDark ? '#0ea5e9' : '#0369a1',
            contrastText: '#ffffff',
          },
          background: {
            default: isDark ? '#0b0b0d' : '#fffaf5',
            paper: isDark ? '#141418' : '#ffffff',
          },
          text: {
            primary: isDark ? '#f5f5f5' : '#1f2937',
            secondary: isDark ? '#b3b3b8' : '#6b7280',
            disabled: isDark ? '#4a4a52' : '#d1d5db',
          },
          divider: isDark ? '#2a2a31' : '#f1e1d4',
          charts: {
            categorical: [
              '#14b8a6',
              '#8b5cf6',
              '#ec4899',
              '#6366f1',
              '#06b6d4',
              '#a855f7',
              '#84cc16',
              '#fb7185',
              '#ff5a3c',
              '#ff2f7d',
              '#2ec4b6',
            ],
          },
        },
        shape: {
          borderRadius: 10,
        },
        typography: {
          fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
          button: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
        components: {
          MuiButton: {
            defaultProps: {
              disableElevation: true,
            },
            styleOverrides: {
              root: {
                borderRadius: 10,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
              },
              containedPrimary: {
                '&:hover': {
                  backgroundColor: isDark ? '#f97316' : '#ea580c',
                },
              },
              outlinedPrimary: {
                borderColor: isDark ? '#fb923c' : '#f97316',
                '&:hover': {
                  backgroundColor: isDark
                    ? 'rgba(251,146,60,0.08)'
                    : 'rgba(249,115,22,0.06)',
                },
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              size: 'small',
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              notchedOutline: {
                borderColor: isDark ? '#2a2a31' : '#f1e1d4',
                transition: 'border-color 0.15s ease',
              },
              root: {
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? '#3a3a44' : '#f0c9a8',
                },
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                color: isDark ? '#b3b3b8' : '#6b7280',
                fontSize: '0.875rem',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
                fontSize: '0.75rem',
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: 10,
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                borderColor: isDark ? '#2a2a31' : '#f1e1d4',
              },
            },
          },
        },
      }),
    [theme, isDark] // isDark is derived from theme; both listed for explicitness
  )

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
