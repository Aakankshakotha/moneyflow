import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Transactions from './pages/Transactions'
import Recurring from './pages/Recurring'
import './App.css'

/**
 * Main application component
 * Sets up routing and navigation
 */
const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="app__content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/recurring" element={<Recurring />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
