import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'

/**
 * Main navigation component
 * Provides links to all primary pages
 */
const Navigation: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <Box
      component="nav"
      sx={{
        backgroundColor: 'var(--card-background)',
        color: 'var(--text-primary)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        boxShadow: 'var(--shadow-soft)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <Box>
        <Typography
          component="span"
          sx={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--primary-color)',
            letterSpacing: '-0.01em',
          }}
        >
          MoneyFlow
        </Typography>
      </Box>
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'flex',
          gap: '2rem',
          flex: 1,
          '& a': {
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            transition: 'background-color 0.2s, color 0.2s',
            '&:hover': {
              backgroundColor: 'var(--hover-background)',
              color: 'var(--text-primary)',
            },
            '&.active': {
              backgroundColor: 'var(--primary-color)',
              color: '#ffffff',
            },
          },
          '& li': { m: 0 },
        }}
      >
        <Box component="li">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'active' : '')}
            end
          >
            Dashboard
          </NavLink>
        </Box>
        <Box component="li">
          <NavLink
            to="/accounts"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Accounts
          </NavLink>
        </Box>
        <Box component="li">
          <NavLink
            to="/transactions"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Transactions
          </NavLink>
        </Box>
        <Box component="li">
          <NavLink
            to="/recurring"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Recurring
          </NavLink>
        </Box>
      </Box>
      <IconButton
        onClick={toggleTheme}
        aria-label="Toggle theme"
        size="small"
        sx={{
          width: 40,
          height: 40,
          fontSize: '1.25rem',
          backgroundColor: 'var(--button-background)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: 'var(--button-hover-background)',
            transform: 'scale(1.05)',
          },
        }}
      >
        {theme === 'light' ? (
          <DarkModeIcon fontSize="small" />
        ) : (
          <LightModeIcon fontSize="small" />
        )}
      </IconButton>
    </Box>
  )
}

export default Navigation
