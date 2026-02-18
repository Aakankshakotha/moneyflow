import React from 'react'
import { NavLink } from 'react-router-dom'
import './Navigation.css'

/**
 * Main navigation component
 * Provides links to all primary pages
 */
const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="navigation__brand">
        <h1>MoneyFlow</h1>
      </div>
      <ul className="navigation__links">
        <li>
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
        </li>
        <li>
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
        </li>
        <li>
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
        </li>
        <li>
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
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
