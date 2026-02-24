import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import './Navigation.css'

/**
 * Main navigation component
 * Provides links to all primary pages
 */
const Navigation: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="navigation">
      <Box className="navigation__brand">
        <Typography
          component="span"
          className="navigation__brand-title"
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
      <Box component="ul" className="navigation__links">
        <Box component="li">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'navigation__link navigation__link--active'
                : 'navigation__link'
            }
            end
          >
            Dashboard
          </NavLink>
        </Box>
        <Box component="li">
          <NavLink
            to="/accounts"
            className={({ isActive }) =>
              isActive
                ? 'navigation__link navigation__link--active'
                : 'navigation__link'
            }
          >
            Accounts
          </NavLink>
        </Box>
        <Box component="li">
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              isActive
                ? 'navigation__link navigation__link--active'
                : 'navigation__link'
            }
          >
            Transactions
          </NavLink>
        </Box>
        <Box component="li">
          <NavLink
            to="/recurring"
            className={({ isActive }) =>
              isActive
                ? 'navigation__link navigation__link--active'
                : 'navigation__link'
            }
          >
            Recurring
          </NavLink>
        </Box>
      </Box>
      <IconButton
        className="navigation__theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        size="small"
        sx={{ width: 40, height: 40, fontSize: '1.25rem' }}
      >
        {theme === 'light' ? (
          <DarkModeIcon fontSize="small" />
        ) : (
          <LightModeIcon fontSize="small" />
        )}
      </IconButton>
    </nav>
  )
}

export default Navigation
