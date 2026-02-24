import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { MuiAppThemeProvider } from '@/theme/MuiAppThemeProvider'
import Box from '@mui/material/Box'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Transactions from './pages/Transactions'
import Recurring from './pages/Recurring'

/**
 * Main application component
 * Sets up routing and navigation
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MuiAppThemeProvider>
        <Router>
          <Box
            component="div"
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Navigation />
            <Box component="main" sx={{ flex: 1, width: '100%', minWidth: 0 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/recurring" element={<Recurring />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </MuiAppThemeProvider>
    </ThemeProvider>
  )
}

export default App
