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

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          primary: {
            main: theme === 'dark' ? '#fb923c' : '#f97316',
            dark: theme === 'dark' ? '#f97316' : '#ea580c',
            light: theme === 'dark' ? '#fdba74' : '#fb923c',
            contrastText: '#ffffff',
          },
          secondary: {
            main: theme === 'dark' ? '#f59e0b' : '#ea580c',
          },
          error: {
            main: theme === 'dark' ? '#f59a9a' : '#dc2626',
          },
          background: {
            default: theme === 'dark' ? '#0b0b0d' : '#fffaf5',
            paper: theme === 'dark' ? '#141418' : '#ffffff',
          },
          text: {
            primary: theme === 'dark' ? '#f5f5f5' : '#1f2937',
            secondary: theme === 'dark' ? '#b3b3b8' : '#6b7280',
          },
          divider: theme === 'dark' ? '#2a2a31' : '#f1e1d4',
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
            styleOverrides: {
              root: {
                borderRadius: 10,
                boxShadow: 'none',
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
          MuiOutlinedInput: {
            styleOverrides: {
              notchedOutline: {
                borderColor: theme === 'dark' ? '#2a2a31' : '#f1e1d4',
              },
            },
          },
        },
      }),
    [theme]
  )

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
